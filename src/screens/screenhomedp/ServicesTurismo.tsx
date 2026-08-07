import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import axios from 'axios';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import NavigationBarColor from 'react-native-navigation-bar-color';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ChevronLeft,
  Clock3,
  MapPin,
  Navigation as NavigationIcon,
  User,
  Car,
  ChevronDown,
  ChevronUp,
  CalendarX2,
  Check,
  CheckCheck,
  ChevronsLeftRight,
  FlagTriangleRight,
} from 'lucide-react-native';
import { Text } from '../../components/ScaledComponents';
import { getBottomSpace, useNavigationMode } from '../../hooks/useNavigationMode';
import { styles } from '../../styles/servicesturismo';
import { useAuthStore } from '../../store/authStore';
import { RootStackParamList } from '../../../App';

// La API de servicios de turismo vive en un servidor fijo, independiente del "server"
// de login/rastreo que devuelve MobileServer para cada cuenta.
const API_SERVTURISMO = 'https://do.velsat.pe:2083/api/ServTurismo';

interface ServicioTurismo {
  idservicio: number;
  fechainicio: string | null;
  instrucciones: string | null;
  horainicio: string | null;
  indicaciones: string | null;
  horaretorno: string | null;
  bus: string | null;
  placa: string | null;
  brevete: string | null;
  piloto: string | null;
  celular: string | null;
  cobrevete: string | null;
  copiloto: string | null;
  cocelular: string | null;
  tipounidad: string | null;
  cliente: string | null;
  grupo: string | null;
  numpax: string | null;
  origen: string | null;
  destino: string | null;
  guiaturista: string | null;
  vuelocliente: string | null;
  observaciones: string | null;
  ejecutivo: string | null;
  cotizacion: string | null;
  // Acuse de recibo del conductor (reemplaza el doble check azul de WhatsApp).
  // Cada estado es una columna booleana independiente (ya no un texto "estado" combinado):
  // visto: se marca solo al mostrarse el servicio en pantalla.
  // confirmado: se marca cuando el conductor desliza la tarjeta hacia la izquierda.
  // finalizado: se marca cuando el conductor desliza hacia la derecha y confirma el modal
  // de advertencia; es el estado final e irreversible del servicio.
  // reprogramado: se marca cuando el conductor (o despacho) cambia la fecha del servicio. No tiene
  // badge propio en la app: el backend limpia visto/confirmado/finalizado al reprogramar, así que
  // la tarjeta simplemente vuelve a mostrarse sin badge hasta que el conductor la confirme/finalice
  // de nuevo con la nueva fecha.
  visto: number | null;
  confirmado: number | null;
  finalizado: number | null;
  reprogramado: number | null;
}

// Endpoints dedicados de acuse de recibo; son idempotentes, así que reintentar es seguro.
async function marcarAcuse(idservicio: number, endpoint: 'visto' | 'confirmado' | 'finalizar') {
  await axios.patch(`${API_SERVTURISMO}/${idservicio}/${endpoint}`, null, {
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });
}

const esVerdadero = (valor: number | null | undefined) => Number(valor) === 1;

function formatearDdMmYyyy(fecha: Date): string {
  const dd = String(fecha.getDate()).padStart(2, '0');
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const yyyy = fecha.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function getFechaHoyDdMmYyyy(): string {
  return formatearDdMmYyyy(new Date());
}

const DIAS_HISTORIAL = 30;

function getFechaInicioHistorialDdMmYyyy(): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - DIAS_HISTORIAL);
  return formatearDdMmYyyy(fecha);
}

// Convierte dd/mm/yyyy a yyyy-mm-dd para poder ordenar y comparar fechas como texto.
function aClaveOrdenable(fechaDdMmYyyy: string | null): string {
  if (!fechaDdMmYyyy) return '';
  const [dd, mm, yyyy] = fechaDdMmYyyy.split('/');
  if (!dd || !mm || !yyyy) return fechaDdMmYyyy;
  return `${yyyy}-${mm}-${dd}`;
}

function combinarPlaca(bus: string | null, placa: string | null): string {
  const busLimpio = (bus || '').trim();
  const placaLimpia = (placa || '').replace(/[^a-zA-Z0-9]/g, '').trim();

  if (!busLimpio && !placaLimpia) return '';
  if (!busLimpio) return placaLimpia;
  if (!placaLimpia) return busLimpio;

  return `${busLimpio}-${placaLimpia}`;
}

const DetalleItem: React.FC<{ label: string; value: string | null }> = ({ label, value }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || '-'}</Text>
  </View>
);

const UMBRAL_CONFIRMACION = 90;

interface ServicioCardProps {
  servicio: ServicioTurismo;
  numero: number | null;
  expandido: boolean;
  // Solo el día de hoy admite deslizar para confirmar/finalizar; los servicios de otras
  // fechas se muestran de solo lectura (ya no hay nada que el conductor deba hacer ahí).
  permiteAcciones: boolean;
  onToggle: () => void;
  onConfirmar: () => void;
  onFinalizar: () => void;
}

const ServicioCard: React.FC<ServicioCardProps> = ({
  servicio,
  numero,
  expandido,
  permiteAcciones,
  onToggle,
  onConfirmar,
  onFinalizar,
}) => {
  const confirmado = esVerdadero(servicio.confirmado);
  const finalizado = esVerdadero(servicio.finalizado);
  const placaCombinada = combinarPlaca(servicio.bus, servicio.placa);
  const hayNotas =
    servicio.instrucciones || servicio.indicaciones || servicio.observaciones;

  const translateX = useRef(new Animated.Value(0)).current;
  // El PanResponder se crea una sola vez; leemos el estado actual por ref
  // para no capturar valores viejos en los callbacks.
  const estadoRef = useRef({ confirmado, finalizado, permiteAcciones, onConfirmar, onFinalizar });
  estadoRef.current = { confirmado, finalizado, permiteAcciones, onConfirmar, onFinalizar };

  const confirmarFinalizacion = () => {
    Alert.alert(
      'Finalizar servicio',
      'Esta acción marcará el servicio como finalizado y no se puede revertir. ¿Deseas continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: () => estadoRef.current.onFinalizar(),
        },
      ],
    );
  };

  const panResponder = useRef(
    PanResponder.create({
      // Solo tomamos el gesto si es claramente horizontal, para no romper el scroll.
      // Si ya está confirmado, no se captura el gesto hacia la izquierda (nada que hacer ahí);
      // el de la derecha (finalizar) sigue disponible.
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        estadoRef.current.permiteAcciones &&
        !estadoRef.current.finalizado &&
        Math.abs(gesture.dx) > 12 &&
        Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5 &&
        !(gesture.dx < 0 && estadoRef.current.confirmado),
      onPanResponderMove: (_evt, gesture) => {
        translateX.setValue(gesture.dx);
      },
      onPanResponderRelease: (_evt, gesture) => {
        if (gesture.dx > UMBRAL_CONFIRMACION) {
          // Derecha: acción irreversible, siempre pasa por el modal de advertencia.
          confirmarFinalizacion();
        } else if (gesture.dx < -UMBRAL_CONFIRMACION && !estadoRef.current.confirmado) {
          // Izquierda: se mantiene igual que antes, sin modal.
          estadoRef.current.onConfirmar();
        }
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 6,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 6,
        }).start();
      },
    }),
  ).current;

  return (
    <View style={styles.swipeWrapper}>
      {permiteAcciones && !finalizado && (
        <View style={styles.swipeBackground}>
          <View style={styles.swipeSideLeft}>
            <FlagTriangleRight size={16} color="#b3261e" />
            <Text style={styles.swipeBackgroundTextFinalizar}>Finalizar</Text>
          </View>
          {!confirmado && (
            <View style={styles.swipeSideRight}>
              <Text style={styles.swipeBackgroundText}>Confirmar</Text>
              <Check size={18} color="#0b7a3b" />
            </View>
          )}
        </View>
      )}

      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...(permiteAcciones && !finalizado ? panResponder.panHandlers : {})}
      >
        <View style={[styles.serviceCard, !permiteAcciones && styles.serviceCardPasado]}>
          <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
            <View style={[styles.serviceHeader, !permiteAcciones && styles.serviceHeaderPasado]}>
              <View style={styles.serviceHeaderLeft}>
                {numero !== null && (
                  <View style={styles.serviceNumberBadge}>
                    <Text style={styles.serviceNumberBadgeText}>{numero}</Text>
                  </View>
                )}
                <Clock3 size={16} color="#fff" />
                <View>
                  <Text style={styles.serviceTime}>
                    {servicio.horainicio || '-'}
                  </Text>
                  <Text style={styles.serviceDate}>
                    {servicio.fechainicio || '-'}
                  </Text>
                </View>
              </View>
              <View style={styles.serviceHeaderRight}>
                {!permiteAcciones ? null : finalizado ? (
                  <View style={styles.statusBadgeFinalizado}>
                    <FlagTriangleRight size={13} color="#fff" />
                    <Text style={styles.statusBadgeFinalizadoText}>Finalizado</Text>
                  </View>
                ) : confirmado ? (
                  <View style={styles.statusBadge}>
                    <CheckCheck size={13} color="#7ef0a8" />
                    <Text style={styles.statusBadgeText}>Confirmado</Text>
                  </View>
                ) : null}
                {expandido ? (
                  <ChevronUp size={20} color="#fff" />
                ) : (
                  <ChevronDown size={20} color="#fff" />
                )}
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.serviceBody}>
            <View style={styles.infoRow}>
              <View style={styles.infoColumn}>
                <View style={styles.infoLabelRow}>
                  <User size={14} color="#666" />
                  <Text style={styles.infoLabel}>Cliente</Text>
                </View>
                <Text style={styles.infoValue}>{servicio.cliente || '-'}</Text>
              </View>
              <View style={styles.infoColumn}>
                <View style={styles.infoLabelRow}>
                  <Car size={14} color="#666" />
                  <Text style={styles.infoLabel}>Placa</Text>
                </View>
                <Text style={styles.infoValue}>{placaCombinada || '-'}</Text>
              </View>
            </View>

            <View style={styles.routeBox}>
              <MapPin size={16} color="#032660ff" />
              <View style={styles.routeTextBlock}>
                <Text style={styles.infoLabel}>Origen</Text>
                <Text style={styles.infoValue}>{servicio.origen || '-'}</Text>
              </View>
            </View>
            <View style={styles.routeBox}>
              <NavigationIcon size={16} color="#032660ff" />
              <View style={styles.routeTextBlock}>
                <Text style={styles.infoLabel}>Destino</Text>
                <Text style={styles.infoValue}>{servicio.destino || '-'}</Text>
              </View>
            </View>
          </View>

          {expandido && (
            <View style={styles.detailContainer}>
              <View>
                <Text style={styles.detailSectionTitle}>Vehículo y Piloto</Text>
                <View style={styles.detailGrid}>
                  <DetalleItem label="Tipo Unidad" value={servicio.tipounidad} />
                  <DetalleItem label="Hora Retorno" value={servicio.horaretorno} />
                  <DetalleItem label="Piloto" value={servicio.piloto} />
                  <DetalleItem label="Copiloto" value={servicio.copiloto} />
                  <DetalleItem label="Celular" value={servicio.celular} />
                  <DetalleItem label="Celular Copiloto" value={servicio.cocelular} />
                </View>
              </View>

              <View>
                <Text style={styles.detailSectionTitle}>Servicio</Text>
                <View style={styles.detailGrid}>
                  <DetalleItem label="Grupo" value={servicio.grupo} />
                  <DetalleItem label="N° Pax" value={servicio.numpax} />
                  <DetalleItem label="Guía Turista" value={servicio.guiaturista} />
                  <DetalleItem label="Vuelo Cliente" value={servicio.vuelocliente} />
                  <DetalleItem label="Ejecutivo" value={servicio.ejecutivo} />
                  <DetalleItem label="Cotización" value={servicio.cotizacion} />
                </View>
              </View>

              {hayNotas && (
                <View>
                  <Text style={styles.detailSectionTitle}>Notas</Text>
                  <View style={styles.notesBox}>
                    {servicio.instrucciones && (
                      <Text style={styles.detailValue}>
                        Instrucciones: {servicio.instrucciones}
                      </Text>
                    )}
                    {servicio.indicaciones && (
                      <Text style={styles.detailValue}>
                        Indicaciones: {servicio.indicaciones}
                      </Text>
                    )}
                    {servicio.observaciones && (
                      <Text style={styles.detailValue}>
                        Observaciones: {servicio.observaciones}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}

          {permiteAcciones && !finalizado && (
            <View style={styles.swipeHint}>
              <ChevronsLeftRight size={14} color="#666" />
              {confirmado ? (
                <Text style={styles.swipeHintText}>
                  Desliza hacia la derecha para{' '}
                  <Text style={styles.swipeHintTextFinalizar}>finalizar</Text> el servicio
                </Text>
              ) : (
                <Text style={styles.swipeHintText}>
                  Desliza a la izquierda para{' '}
                  <Text style={styles.swipeHintTextConfirmar}>confirmar</Text>, a la derecha para{' '}
                  <Text style={styles.swipeHintTextFinalizar}>finalizar</Text>
                </Text>
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.clickPrompt}
            onPress={onToggle}
            activeOpacity={0.7}
          >
            {expandido ? (
              <ChevronUp size={16} color="#032660ff" />
            ) : (
              <ChevronDown size={16} color="#032660ff" />
            )}
            <Text style={styles.clickPromptText}>
              {expandido ? 'Ocultar detalles' : 'Ver detalles completos'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const ServicesTurismo: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuthStore();
  const brevete = user?.brevete;

  const [servicios, setServicios] = useState<ServicioTurismo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [expandidoId, setExpandidoId] = useState<number | null>(null);
  // Fechas cuyo grupo de servicios anteriores está desplegado (estilo WhatsApp).
  const [diasExpandidos, setDiasExpandidos] = useState<Set<string>>(new Set());

  const scrollViewRef = useRef<ScrollView>(null);
  // Posición del grupo de hoy dentro del scroll, para enfocarlo al entrar aunque
  // haya varios días de historial arriba.
  const hoyOffsetYRef = useRef(0);
  const yaEnfocoHoyRef = useRef(false);

  const insets = useSafeAreaInsets();
  const navigationDetection = useNavigationMode();
  const bottomSpace = getBottomSpace(insets, navigationDetection.hasNavigationBar);
  const topSpace = insets.top + 5;

  useFocusEffect(
    React.useCallback(() => {
      NavigationBarColor('#ffffff', true);
    }, []),
  );

  const fetchServicios = useCallback(async () => {
    if (!brevete) {
      setServicios([]);
      setError('No se encontró el brevete del conductor en la sesión.');
      setIsLoading(false);
      setRefreshing(false);
      return;
    }

    setError(null);

    try {
      const fechaFin = getFechaHoyDdMmYyyy();
      const fechaInicio = getFechaInicioHistorialDdMmYyyy();
      const url = `${API_SERVTURISMO}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&brevete=${encodeURIComponent(brevete)}`;

      const response = await axios.get(url, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      });

      setServicios(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setServicios([]);
      } else {
        setError('No se pudieron cargar tus servicios. Desliza hacia abajo para reintentar.');
        setServicios([]);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [brevete]);

  useEffect(() => {
    fetchServicios();
  }, [fetchServicios]);

  // Enfoca el grupo de hoy al terminar de cargar, sin importar cuántos días
  // de historial queden por encima. Solo la primera vez, para no pelear con
  // el scroll manual del conductor en refrescos posteriores.
  useEffect(() => {
    if (isLoading || yaEnfocoHoyRef.current || hoyOffsetYRef.current === 0) return;
    yaEnfocoHoyRef.current = true;
    const timeoutId = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: hoyOffsetYRef.current, animated: false });
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [isLoading, servicios]);

  // Al quedar los servicios en pantalla los damos por vistos (equivale al
  // doble check azul de WhatsApp). Se marca una sola vez por servicio.
  useEffect(() => {
    const pendientes = servicios.filter(s => !esVerdadero(s.visto));
    if (isLoading || pendientes.length === 0) return;

    let cancelado = false;

    (async () => {
      const marcados: number[] = [];

      await Promise.all(
        pendientes.map(async s => {
          try {
            await marcarAcuse(s.idservicio, 'visto');
            marcados.push(s.idservicio);
          } catch {
            // Si falla se reintentará en la próxima carga de la pantalla.
          }
        }),
      );

      if (cancelado || marcados.length === 0) return;

      setServicios(prev =>
        prev.map(s =>
          marcados.includes(s.idservicio) ? { ...s, visto: 1 } : s,
        ),
      );
    })();

    return () => {
      cancelado = true;
    };
  }, [servicios, isLoading]);

  const confirmarServicio = useCallback(async (idservicio: number) => {
    // Optimista: el conductor ve la confirmación al instante.
    setServicios(prev =>
      prev.map(s => (s.idservicio === idservicio ? { ...s, confirmado: 1 } : s)),
    );

    try {
      await marcarAcuse(idservicio, 'confirmado');
    } catch {
      setServicios(prev =>
        prev.map(s =>
          s.idservicio === idservicio ? { ...s, confirmado: 0 } : s,
        ),
      );
      setAviso('No se pudo confirmar el servicio. Inténtalo nuevamente.');
    }
  }, []);

  const finalizarServicio = useCallback(async (idservicio: number) => {
    // Optimista: el conductor ve el estado final al instante, tras confirmar el modal.
    setServicios(prev =>
      prev.map(s => (s.idservicio === idservicio ? { ...s, finalizado: 1 } : s)),
    );

    try {
      await marcarAcuse(idservicio, 'finalizar');
    } catch {
      setServicios(prev =>
        prev.map(s =>
          s.idservicio === idservicio ? { ...s, finalizado: 0 } : s,
        ),
      );
      setAviso('No se pudo finalizar el servicio. Inténtalo nuevamente.');
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchServicios();
  }, [fetchServicios]);

  const toggleExpandido = (idservicio: number) => {
    setExpandidoId(prev => (prev === idservicio ? null : idservicio));
  };

  const toggleDia = (fecha: string) => {
    setDiasExpandidos(prev => {
      const siguiente = new Set(prev);
      if (siguiente.has(fecha)) {
        siguiente.delete(fecha);
      } else {
        siguiente.add(fecha);
      }
      return siguiente;
    });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const hoy = getFechaHoyDdMmYyyy();

  // Agrupa los servicios por fecha y ordena los grupos del más reciente al más antiguo,
  // igual que WhatsApp muestra primero la conversación de hoy.
  const gruposPorFecha = useMemo(() => {
    const mapa = new Map<string, ServicioTurismo[]>();
    servicios.forEach(s => {
      const clave = s.fechainicio || 'Sin fecha';
      const lista = mapa.get(clave) || [];
      lista.push(s);
      mapa.set(clave, lista);
    });

    return Array.from(mapa.entries()).sort(
      (a, b) => aClaveOrdenable(a[0]).localeCompare(aClaveOrdenable(b[0])),
    );
  }, [servicios]);

  const serviciosHoyCount = gruposPorFecha.find(([fecha]) => fecha === hoy)?.[1].length ?? 0;

  return (
    <View style={[styles.container, { paddingBottom: bottomSpace }]}>
      <LinearGradient
        colors={['#05194fff', '#05194fff', '#18223dff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.header, { paddingTop: topSpace }]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleBlock}>
            <Text style={styles.headerMainTitle}>Servicios de Turismo</Text>
            <Text style={styles.headerSubtitle}>
              {user?.description || user?.username} · Hoy {getFechaHoyDdMmYyyy()}
            </Text>
          </View>
          {!isLoading && !error && (
            <View style={styles.headerCountBadge}>
              <Text style={styles.headerCountBadgeText}>{serviciosHoyCount}</Text>
              <Text style={styles.headerCountBadgeLabel}>
                {serviciosHoyCount === 1 ? 'serv.' : 'servs.'}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        ref={scrollViewRef}
        style={styles.contentList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#e36414']}
            tintColor="#e36414"
            title="Actualizando servicios..."
            titleColor="#fff"
          />
        }
      >
        <View style={styles.formContainer}>
          {aviso && (
            <TouchableOpacity
              style={styles.avisoBanner}
              onPress={() => setAviso(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.avisoBannerText}>{aviso}</Text>
            </TouchableOpacity>
          )}
          {isLoading ? (
            <View style={styles.emptyStateContainer}>
              <ActivityIndicator size="large" color="#e36414" />
              <Text style={styles.emptyStateTitle}>Cargando servicios</Text>
              <Text style={styles.emptyStateSubtitle}>Por favor espera un momento</Text>
            </View>
          ) : error ? (
            <View style={styles.emptyStateContainer}>
              <View style={[styles.iconCircle, styles.iconCircleLarge]}>
                <CalendarX2 size={40} color="#e36414" />
              </View>
              <Text style={styles.emptyStateTitleDark}>Ocurrió un problema</Text>
              <Text style={styles.emptyStateDescription}>{error}</Text>
            </View>
          ) : servicios.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={[styles.iconCircle, styles.iconCircleLarge]}>
                <CalendarX2 size={40} color="#e36414" />
              </View>
              <Text style={styles.emptyStateTitleDark}>Sin servicios hoy</Text>
              <Text style={styles.emptyStateDescription}>
                Aún no tienes servicios de turismo programados para el día de hoy
              </Text>
            </View>
          ) : (
            gruposPorFecha.map(([fecha, serviciosDelDia]) => {
              const esHoy = fecha === hoy;
              const desplegado = esHoy || diasExpandidos.has(fecha);

              return (
                <View
                  key={fecha}
                  style={styles.dayGroup}
                  onLayout={
                    esHoy
                      ? e => {
                          hoyOffsetYRef.current = e.nativeEvent.layout.y;
                        }
                      : undefined
                  }
                >
                  {!esHoy && (
                    <TouchableOpacity
                      style={styles.dayGroupHeader}
                      onPress={() => toggleDia(fecha)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dayGroupHeaderText}>{fecha}</Text>
                      <View style={styles.dayGroupHeaderRight}>
                        {desplegado ? (
                          <ChevronUp size={18} color="#6b7280" />
                        ) : (
                          <ChevronDown size={18} color="#6b7280" />
                        )}
                      </View>
                    </TouchableOpacity>
                  )}

                  {desplegado &&
                    serviciosDelDia.map((servicio, index) => (
                      <ServicioCard
                        key={servicio.idservicio}
                        servicio={servicio}
                        numero={esHoy ? index + 1 : null}
                        expandido={expandidoId === servicio.idservicio}
                        permiteAcciones={esHoy}
                        onToggle={() => toggleExpandido(servicio.idservicio)}
                        onConfirmar={() => confirmarServicio(servicio.idservicio)}
                        onFinalizar={() => finalizarServicio(servicio.idservicio)}
                      />
                    ))}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ServicesTurismo;
