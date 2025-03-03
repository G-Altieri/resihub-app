'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import api from '../../scripts/request';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Svg, { Circle } from 'react-native-svg';

import SensoreIcon from '../../assets/svg/sensore/sensore.svg';
import TipologiaIcon from '../../assets/svg/sensore/tipologia.svg';
import UnitaIcon from '../../assets/svg/sensore/unitadimisura.svg';
import MisurazioneIcon from '../../assets/svg/sensore/ultimovalore.svg';
import ArrowSx from '../../assets/svg/sensore/arrowsx.svg';
import ArrowDx from '../../assets/svg/sensore/arrowdx.svg';
import SettimanaleIcon from '../../assets/svg/sensore/settimana.svg';
import MensileIcon from '../../assets/svg/sensore/calendario.svg';
import MediaIcon from '../../assets/svg/sensore/media.svg';

// Interfacce per tipizzare i dati
interface SensorValue {
  idSensore: number;
  valore: string;
  timestamp: string;
}

interface Dispositivo {
  idDispositivo: number;
  nome: string;
  marca: string;
  modello: string;
  tipo: string;
  stato: string;
  parametri: any;
}

interface Parametro {
  idParametro: number;
  nome: string;
  tipologia: string;
  unitaMisura: string;
  valMin: number;
  valMax: number;
  valori: any;
}

interface SensorData {
  dispositivo: Dispositivo;
  condominio: any;
  parametro: Parametro;
  valoriSensore: SensorValue[];
  user: any;
}

// Componente ProgressRing per il box di misurazione
const ProgressRing = ({
  size,
  strokeWidth,
  progress,
  min,
  max,
  centerText,
}: {
  size: number;
  strokeWidth: number;
  progress: number;
  min: number;
  max: number;
  centerText?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalized = max - min !== 0 ? (progress - min) / (max - min) : 0;
  const progressNormalized = Math.max(0, Math.min(1, normalized));
  const strokeDashoffset = circumference - progressNormalized * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          stroke="#3E4C59"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke="#BAFF29"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <Text style={styles.progressText}>
          {centerText ? centerText : `${Math.round(progressNormalized * 100)}%`}
        </Text>
      </View>
    </View>
  );
};

export default function SensorDataScreen() {
  const { idValoreSensore, idCondominio, idDispositivo } = useLocalSearchParams();
  const [data, setData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  // Stato per navigare fra settimane: 0 = settimana corrente, -1 = settimana precedente, ecc.
  const [weekOffset, setWeekOffset] = useState<number>(0);
  // Stato per navigare fra mesi: 0 = mese corrente, -1 = mese precedente, ecc.
  const [monthOffset, setMonthOffset] = useState<number>(0);

  const fetchData = async () => {
    try {
      const response = await api.get(
        `/api/general/condominio/${idCondominio}/dispositivo/${idDispositivo}/parametro/${idValoreSensore}`
      );
      setData(response.data);
    } catch (err: any) {
      console.error('Errore durante la richiesta dei dati:', err);
      setError('Errore durante la richiesta dei dati');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Image
          source={require('../../assets/images/SfondoEnergia.jpg')}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#70A600" style={styles.loader} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.container}>
        <Image
          source={require('../../assets/images/SfondoEnergia.jpg')}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
        />
        <Text style={styles.errorText}>{error || 'Nessun dato disponibile'}</Text>
      </View>
    );
  }

  // Ordina le misurazioni per timestamp
  const sortedValues = data.valoriSensore.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // ===================== GRAFICO SETTIMANALE (ultimi 7 giorni) =====================
  const now = new Date();
  const adjustedEndDate = new Date(now);
  adjustedEndDate.setDate(now.getDate() + weekOffset * 7);
  const startDate = new Date(adjustedEndDate);
  startDate.setDate(adjustedEndDate.getDate() - 6);
  const last7Days: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d;
  });
  const weekLabels = last7Days.map((date) =>
    date.toLocaleDateString('it-IT', { weekday: 'short' })
  );
  const chartWeekData: number[] = last7Days.map((date) => {
    const measurementsForDay = sortedValues.filter((item) => {
      const itemDate = new Date(item.timestamp);
      return (
        itemDate.getDate() === date.getDate() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getFullYear() === date.getFullYear()
      );
    });
    return measurementsForDay.length > 0
      ? parseFloat(measurementsForDay[measurementsForDay.length - 1].valore)
      : 0;
  });
  const today = new Date();
  const todayIndex =
    weekOffset === 0
      ? last7Days.findIndex(
        (date) =>
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
      )
      : -1;
  const validWeekData = chartWeekData.filter((x) => !isNaN(x));
  const extendedWeekData = [...chartWeekData];
  const extendedWeekLabels = [...weekLabels];
  if (validWeekData.length === 0) {
    extendedWeekData.push(data.parametro.valMin, data.parametro.valMax);
    extendedWeekLabels.push('', '');
  } else {
    if (Math.min(...validWeekData) > data.parametro.valMin) {
      extendedWeekData.unshift(data.parametro.valMin);
      extendedWeekLabels.unshift('');
    }
    if (Math.max(...validWeekData) < data.parametro.valMax) {
      extendedWeekData.push(data.parametro.valMax);
      extendedWeekLabels.push('');
    }
  }
  const weekRangeText = `${startDate.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
  })} - ${adjustedEndDate.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
  })}`;

  // ===================== GRAFICO MENSILE (line chart) =====================
  const monthStart = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0);
  const monthDays: Date[] = Array.from({ length: monthEnd.getDate() }, (_, i) => {
    const d = new Date(monthStart);
    d.setDate(monthStart.getDate() + i);
    return d;
  });
  const monthLabels = monthDays.map((date) => date.getDate().toString());
  const monthlyChartData: number[] = monthDays.map((date) => {
    const measurementsForDay = sortedValues.filter((item) => {
      const itemDate = new Date(item.timestamp);
      return (
        itemDate.getDate() === date.getDate() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getFullYear() === date.getFullYear()
      );
    });
    return measurementsForDay.length > 0
      ? parseFloat(measurementsForDay[measurementsForDay.length - 1].valore)
      : 0;
  });
  const todayMonthIndex =
    monthOffset === 0
      ? monthDays.findIndex(
        (date) =>
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
      )
      : -1;
  const validMonthData = monthlyChartData.filter((x) => !isNaN(x));
  const extendedMonthlyData = [...monthlyChartData];
  const extendedMonthLabels = [...monthLabels];
  if (validMonthData.length === 0) {
    extendedMonthlyData.push(data.parametro.valMin, data.parametro.valMax);
    extendedMonthLabels.push('', '');
  } else {
    if (Math.min(...validMonthData) > data.parametro.valMin) {
      extendedMonthlyData.unshift(data.parametro.valMin);
      extendedMonthLabels.unshift('');
    }
    if (Math.max(...validMonthData) < data.parametro.valMax) {
      extendedMonthlyData.push(data.parametro.valMax);
      extendedMonthLabels.push('');
    }
  }
  // Filtro per ridurre l'affollamento delle label
  const filteredMonthLabels = extendedMonthLabels.map((label, index) => {
    if (monthDays.length > 15) {
      return index % 3 === 0 ? label : '';
    } else if (monthDays.length > 10) {
      return index % 2 === 0 ? label : '';
    }
    return label;
  });
  const monthRangeText = `${monthStart.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })} - ${monthEnd.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })}`;

  // ===================== GRAFICO A BARRE: Media settimanale del mese =====================
  const monthDataValues = sortedValues.filter((item) => {
    const d = new Date(item.timestamp);
    return d >= monthStart && d <= monthEnd;
  });
  const numberOfWeeks = Math.ceil(monthEnd.getDate() / 7);
  const weekLabelsForBar: string[] = [];
  const weeklyAverages: number[] = [];
  for (let i = 0; i < numberOfWeeks; i++) {
    const weekStartDay = i * 7 + 1;
    const weekEndDay = Math.min((i + 1) * 7, monthEnd.getDate());
    weekLabelsForBar.push(`Set ${i + 1}`);
    const readings = monthDataValues.filter((item) => {
      const d = new Date(item.timestamp);
      const day = d.getDate();
      return day >= weekStartDay && day <= weekEndDay;
    });
    if (readings.length > 0) {
      const sum = readings.reduce((acc, cur) => acc + parseFloat(cur.valore), 0);
      const avg = sum / readings.length;
      weeklyAverages.push(avg);
    } else {
      weeklyAverages.push(0);
    }
  }
  const showBarChart = !weeklyAverages.every((val) => isNaN(val));

  // ===================== BOX DI MISURAZIONE (ultimi 7 giorni) =====================
  const measurementsLast7Days = sortedValues.filter(
    (item) => new Date(item.timestamp) >= startDate
  );
  const lastMeasurement =
    measurementsLast7Days.length > 0
      ? measurementsLast7Days[measurementsLast7Days.length - 1]
      : sortedValues[sortedValues.length - 1];
  const lastValueNum = parseFloat(lastMeasurement.valore);
  const lastTimestamp = lastMeasurement.timestamp;
  const measurementDate = new Date(lastTimestamp);
  const formattedDate = measurementDate.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = measurementDate.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Stili per i grafici e le sezioni
  const monthlyChartConfig = {
    backgroundColor: '#1A1B41',
    backgroundGradientFrom: '#1A1B41',
    backgroundGradientTo: '#1A1B41',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(150,200,250,${opacity})`,
    labelColor: (opacity = 1) => `rgba(241,255,231,${opacity})`,
    fillShadowGradient: '#C2E7DA',
    fillShadowGradientOpacity: 0.3,
    style: { borderRadius: 0 },
  };

  const barChartConfig = {
    backgroundColor: '#1A1B41',
    backgroundGradientFrom: '#1A1B41',
    backgroundGradientTo: '#1A1B41',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255,165,0,${opacity})`,
    labelColor: (opacity = 1) => `rgba(241,255,231,${opacity})`,
    style: { borderRadius: 0 },
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/SfondoEnergia.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Box dispositivo */}
        <View style={styles.sectionBox}>
          <Text style={styles.deviceTitle}>{data.dispositivo.nome}</Text>
          <View style={styles.row}>
            <SensoreIcon width={24} height={24} style={styles.icon} />
            <Text style={styles.sensorText}> {data.parametro.nome}</Text>
          </View>
          <View style={styles.row}>
            <TipologiaIcon width={24} height={24} style={styles.icon} />
            <Text style={styles.detailText}> {data.parametro.tipologia}</Text>
          </View>
          <View style={styles.row}>
            <UnitaIcon width={24} height={24} style={styles.icon} />
            <Text style={styles.detailText}> {data.parametro.unitaMisura}</Text>
          </View>
        </View>
        {/* Titoletto */}
        <Text style={styles.titleValori}>Valori Misurazioni</Text>
        {/* Box ultimo valore */}
        <View style={styles.sectionBoxUltimaMisurazione}>
          <View style={styles.rowUltimaMisurazione}>
            <MisurazioneIcon width={24} height={24} style={styles.icon} />
            <Text style={styles.subtitle}>Ultima Misurazione</Text>
          </View>
          <ProgressRing
            size={150}
            strokeWidth={10}
            progress={lastValueNum}
            min={data.parametro.valMin}
            max={data.parametro.valMax}
            centerText={`${lastValueNum} ${data.parametro.unitaMisura}`}
          />
          <View style={styles.measurementLabels}>
            <Text style={styles.labelText}>
              Min: {data.parametro.valMin} {data.parametro.unitaMisura}
            </Text>
            <Text style={styles.labelText}>
              Max: {data.parametro.valMax} {data.parametro.unitaMisura}
            </Text>
          </View>
          <Text style={styles.measurementDate}>
            Misurato il: {formattedDate} - {formattedTime}
          </Text>
        </View>

        {/* ---------------------- GRAFICO SETTIMANALE ---------------------- */}
        <View style={styles.chartBoxWeekly}>
          <View style={styles.rowUltimaMisurazione}>
            <SettimanaleIcon width={24} height={28} style={styles.icon} />
            <Text style={styles.subtitle}>Settimanale</Text>
          </View>
          <View style={styles.weekNavigator}>
            <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)}>
              <ArrowSx style={styles.arrowIcon} width={30} height={30} />
            </TouchableOpacity>
            <Text style={styles.weekRangeText}>{weekRangeText}</Text>
            <TouchableOpacity
              onPress={() => weekOffset < 0 && setWeekOffset(weekOffset + 1)}
              disabled={weekOffset === 0}
            >
              <ArrowDx style={[styles.arrowIcon, weekOffset === 0 && styles.disabledArrow]} width={30} height={30} />
            </TouchableOpacity>
          </View>
          <View style={styles.chartWrapper}>
            <LineChart
              data={{
                labels: extendedWeekLabels,
                datasets: [{ data: extendedWeekData }],
              }}
              width={Dimensions.get('window').width - 42}
              height={220}
              withDots={false}
              renderDotContent={(props: any) => {
                const { x, y, index } = props;
                const extraItems = extendedWeekData.length - chartWeekData.length;
                if (index === todayIndex + extraItems && todayIndex !== -1) {
                  return (
                    <View
                      style={{
                        position: 'absolute',
                        top: y - 6,
                        left: x - 6,
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: '#70A600',
                      }}
                    />
                  );
                }
                return null;
              }}
              yAxisSuffix={` ${data.parametro.unitaMisura}`}
              chartConfig={{
                backgroundColor: '#1A1B41',
                backgroundGradientFrom: '#1A1B41',
                backgroundGradientTo: '#1A1B41',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(98,144,195,${opacity})`,
                labelColor: (opacity = 1) => `rgba(241,255,231,${opacity})`,
                fillShadowGradient: '#C1292E',
                fillShadowGradientOpacity: 0.3,
                style: {},
              }}
              style={{ marginVertical: 0, borderRadius: 0, paddingHorizontal: 0, paddingBottom: 0 }}
            />
          </View>
        </View>
        {/* ---------------------- GRAFICO MENSILE ---------------------- */}
        <View style={styles.chartBoxMonthly}>
          <View style={styles.rowUltimaMisurazione}>
            <MensileIcon width={24} height={28} style={styles.icon} />
            <Text style={styles.subtitle}>Mensile</Text>
          </View>
          <View style={styles.monthNavigator}>
            <TouchableOpacity onPress={() => setMonthOffset(monthOffset - 1)}>
              <ArrowSx style={styles.arrowIcon} width={30} height={30} />
            </TouchableOpacity>
            <Text style={styles.monthRangeText}>{monthRangeText}</Text>
            <TouchableOpacity
              onPress={() => monthOffset < 0 && setMonthOffset(monthOffset + 1)}
              disabled={monthOffset === 0}
            >
              <ArrowDx style={[styles.arrowIcon, monthOffset === 0 && styles.disabledArrow]} width={30} height={30} />
            </TouchableOpacity>
          </View>


          <View style={styles.chartWrapper}>
            <LineChart
              data={{
                labels: filteredMonthLabels,
                datasets: [{ data: extendedMonthlyData }],
              }}
              width={Dimensions.get('window').width - 42}
              height={220}
              withDots={false}
              withInnerLines={false}
              withOuterLines={false}
              renderDotContent={(props: any) => {
                const { x, y, index } = props;
                if (monthOffset === 0 && index === todayMonthIndex) {
                  return (
                    <View
                      style={{
                        position: 'absolute',
                        top: y - 6,
                        left: x - 6,
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: 'transparent', // nota: "transparent" è la scrittura corretta
                      }}
                    />
                  );
                }
                return null;
              }}
              yAxisSuffix={` ${data.parametro.unitaMisura}`}
              chartConfig={monthlyChartConfig}
              style={{ marginVertical: 0, paddingHorizontal: 0, paddingBottom: 0 }}
            />
          </View>

        </View>

        {/* ---------------------- GRAFICO A BARRE: Media settimanale del mese ---------------------- */}
        <View style={styles.chartBoxWeeklyAverage}>
          <View style={styles.rowUltimaMisurazione}>
            <MediaIcon width={24} height={28} style={styles.icon} />
            <Text style={styles.subtitle}>Media del Mese</Text>
          </View>
          {weeklyAverages.every((val) => isNaN(val)) ? (
            <Text style={styles.errorText}>Nessun dato disponibile per il grafico a barre</Text>
          ) : (

            <View style={styles.chartWrapper}>
              {/* @ts-ignore */}
              <BarChart
                data={{
                  labels: weekLabelsForBar,
                  datasets: [
                    {
                      data: weeklyAverages.map((val) => (isNaN(val) ? 0 : val)),
                    },
                  ],
                }}
                width={Dimensions.get('window').width - 50}
                height={220}
                chartConfig={barChartConfig}
                style={{ marginVertical: 0, borderRadius: 0, paddingHorizontal: 0, paddingBottom: 0 }}
              />
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 90,
    padding: 16,
    backgroundColor: '#1A1B41',
  },
  content: {
    paddingBottom: 20,
  },
  sectionBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    alignItems: 'flex-start',
    marginTop: 16,
    borderColor: '#70A600',
    borderWidth: 2,
  },
  chartWrapper: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderRadius: 10,
    padding: 2,
    paddingTop: 10,
    backgroundColor: "#1A1B41",
    overflow: 'hidden',
  },
  deviceTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#ECECEC',
    marginBottom: 12,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  sensorText: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#ECECEC',
  },
  detailText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#ECECEC',
  },
  measurementLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  titleValori: {
    color: '#ECECEC',
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 10,
  },
  labelText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#ECECEC',
  },
  measurementDate: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#ECECEC',
    textAlign: 'center',
  },
  weekRangeText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#ECECEC',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  weekNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  monthNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  monthRangeText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#ECECEC',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  arrowIcon: {
    width: 10,
    height: 10,
    marginHorizontal: 10,
  },
  disabledArrow: {
    opacity: 0.5,
  },
  progressText: {
    fontSize: 18,
    color: '#ECECEC',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    color: '#FF5555',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  loader: {
    marginTop: 20,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#ECECEC',
    marginBottom: 5,
    textAlign: 'center',
  },
  sectionBoxUltimaMisurazione: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    marginTop: 16,
    borderColor: '#6290C3',
    borderWidth: 2,
  },
  rowUltimaMisurazione: {
    flexDirection: 'row',
    marginBottom: 12,
    alignSelf: 'center',
  },
  // Stili separati per i box dei grafici: puoi modificare qui il colore del bordo o altri parametri
  chartBoxWeekly: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    paddingTop: 16,
    marginBottom: 20,
    marginTop: 16,
    borderColor: '#C1292E', // cambia qui il colore per il grafico settimanale
    borderWidth: 2,
  },
  chartBoxMonthly: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    paddingTop: 16,
    marginBottom: 20,
    marginTop: 16,
    borderColor: '#C2E7DA', // cambia qui il colore per il grafico mensile
    borderWidth: 2,
  },
  chartBoxWeeklyAverage: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    paddingTop: 16,
    marginBottom: 20,
    marginTop: 16,
    borderColor: '#FFA500', // cambia qui il colore per il grafico a barre
    borderWidth: 2,
  },
});
