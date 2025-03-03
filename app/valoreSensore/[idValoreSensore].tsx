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

// Componente ProgressRing (per il box di misurazione)
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

  // Fetch dei dati
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
  const todayIndex = weekOffset === 0
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
  const todayMonthIndex = monthOffset === 0
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
  const monthData = sortedValues.filter((item) => {
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
    const readings = monthData.filter((item) => {
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
  // Se tutti i valori sono NaN, mostra un messaggio invece del BarChart
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

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/SfondoEnergia.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Titolo parametro */}
        <View style={styles.headerContainer}>
          <Text style={styles.greeting}>{data.parametro.nome}</Text>
        </View>

        {/* Box dispositivo */}
        <View style={styles.deviceBox}>
          <Text style={styles.deviceTitle}>{data.dispositivo.nome}</Text>
          <Text style={styles.deviceText}>Marca: {data.dispositivo.marca}</Text>
          <Text style={styles.deviceText}>Modello: {data.dispositivo.modello}</Text>
          <Text style={styles.deviceText}>Tipo: {data.dispositivo.tipo}</Text>
          <Text style={styles.deviceText}>Stato: {data.dispositivo.stato}</Text>
        </View>

        <View style={styles.separator} />

        {/* Dati parametro */}
        <View style={styles.detailsContainer}>
          <Text style={styles.subtitle}>{data.parametro.nome}</Text>
          <Text style={styles.detailText}>Tipologia: {data.parametro.tipologia}</Text>
          <Text style={styles.detailText}>Unità di misura: {data.parametro.unitaMisura}</Text>
          <Text style={styles.detailText}>Valore Min: {data.parametro.valMin}</Text>
          <Text style={styles.detailText}>Valore Max: {data.parametro.valMax}</Text>
        </View>

        <View style={styles.separator} />

        {/* Box misurazione */}
        <View style={styles.measurementBox}>
          <Text style={styles.subtitle}>Ultimo Valore</Text>
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

        <View style={styles.separator} />

        {/* Navigator settimanale */}
        <View style={styles.weekNavigator}>
          <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)}>
            <Text style={styles.arrowText}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.weekRangeText}>{weekRangeText}</Text>
          <TouchableOpacity
            onPress={() => weekOffset < 0 && setWeekOffset(weekOffset + 1)}
            disabled={weekOffset === 0}
          >
            <Text style={[styles.arrowText, weekOffset === 0 && styles.disabledArrow]}>
              {">"}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Andamento degli ultimi 7 giorni</Text>
        <LineChart
          data={{
            labels: extendedWeekLabels,
            datasets: [{ data: extendedWeekData }],
          }}
          width={Dimensions.get('window').width - 32}
          height={220}
          withDots={false}
          renderDotContent={({ x, y, index }) => {
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
            fillShadowGradient: '#BAFF29',
            fillShadowGradientOpacity: 0.3,
            style: { borderRadius: 16 },
          }}
          style={{ marginVertical: 8, borderRadius: 16 }}
        />

        <View style={styles.separator} />

        {/* Navigator mensile */}
        <View style={styles.monthNavigator}>
          <TouchableOpacity onPress={() => setMonthOffset(monthOffset - 1)}>
            <Text style={styles.arrowText}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.monthRangeText}>{monthRangeText}</Text>
          <TouchableOpacity
            onPress={() => monthOffset < 0 && setMonthOffset(monthOffset + 1)}
            disabled={monthOffset === 0}
          >
            <Text style={[styles.arrowText, monthOffset === 0 && styles.disabledArrow]}>
              {">"}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Andamento del mese</Text>
        <LineChart
          data={{
            labels: extendedMonthLabels,
            datasets: [{ data: extendedMonthlyData }],
          }}
          width={Dimensions.get('window').width - 32}
          height={220}
          withDots={false}
          renderDotContent={({ x, y, index }) => {
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
            color: (opacity = 1) => `rgba(150,200,250,${opacity})`,
            labelColor: (opacity = 1) => `rgba(241,255,231,${opacity})`,
            fillShadowGradient: '#F5A623',
            fillShadowGradientOpacity: 0.3,
            style: { borderRadius: 16 },
          }}
          style={{ marginVertical: 8, borderRadius: 16 }}
        />

        <View style={styles.separator} />

        {/* GRAFICO A BARRE: Media settimanale del mese */}
        <Text style={styles.subtitle}>Media settimanale del mese</Text>
        {weeklyAverages.every(val => isNaN(val)) ? (
          <Text style={styles.errorText}>
            Nessun dato disponibile per il grafico a barre
          </Text>
        ) : (
          <BarChart
            data={{
              labels: weekLabelsForBar,
              datasets: [
                {
                  // Converto eventuali NaN in 0 per la visualizzazione
                  data: weeklyAverages.map(val => isNaN(val) ? 0 : val),
                },
              ],
            }}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#1A1B41',
              backgroundGradientFrom: '#1A1B41',
              backgroundGradientTo: '#1A1B41',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(200,150,100,${opacity})`,
              labelColor: (opacity = 1) => `rgba(241,255,231,${opacity})`,
              style: { borderRadius: 16 },
            }}
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        )}
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    color: '#F1FFE7',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  deviceBox: {
    backgroundColor: '#000000',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  deviceTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#F1FFE7',
    marginBottom: 8,
    textAlign: 'center',
  },
  deviceText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#F1FFE7',
    marginBottom: 4,
    textAlign: 'center',
  },
  detailsContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#F1FFE7',
    marginBottom: 5,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#F1FFE7',
    marginBottom: 4,
    textAlign: 'center',
  },
  separator: {
    marginVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: '#FF5555',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  measurementBox: {
    backgroundColor: '#000000',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  measurementLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  labelText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#F1FFE7',
  },
  measurementDate: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#F1FFE7',
    textAlign: 'center',
  },
  weekRangeText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#F1FFE7',
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
    color: '#F1FFE7',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  arrowText: {
    fontSize: 24,
    color: '#F1FFE7',
    marginHorizontal: 10,
  },
  disabledArrow: {
    opacity: 0.5,
  },
  progressText: {
    fontSize: 18,
    color: '#F1FFE7',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginTop: 50,
  },
});
