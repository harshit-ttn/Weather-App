import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  ActivityIndicator,
  ImageBackground,
  FlatList,
} from "react-native";
import * as Location from "expo-location";
import API_KEY from "@env";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bgImage, setBgImage] = useState(require("./assets/default.jpg"));

  useEffect(() => {
    getLocationWeather();
  }, []);

  const getLocationWeather = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      await fetchWeatherByCoords(latitude, longitude);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    const current = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    const forecastData = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );

    const currentJson = await current.json();
    const forecastJson = await forecastData.json();

    if (currentJson.cod === 200) {
      setWeather(currentJson);
      setForecast(forecastJson.list.slice(0, 5)); // next 5 slots (~15 hours)
      updateBackground(currentJson.weather[0].main);
    }
  };

  const fetchWeatherByCity = async () => {
    if (!city) return;
    setLoading(true);
    try {
      const current = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );
      const forecastData = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
      );

      const currentJson = await current.json();
      const forecastJson = await forecastData.json();

      if (currentJson.cod === 200) {
        setWeather(currentJson);
        setForecast(forecastJson.list.slice(0, 5));
        updateBackground(currentJson.weather[0].main);
      } else {
        alert("City not found!");
      }
    } catch (error) {
      alert("Error fetching weather!");
    } finally {
      setLoading(false);
    }
  };

  const updateBackground = (condition) => {
    switch (condition) {
      case "Clear":
        setBgImage(require("./assets/sunny.jpg"));
        break;
      case "Clouds":
        setBgImage(require("./assets/cloudy.jpg"));
        break;
      case "Rain":
        setBgImage(require("./assets/rainy.jpg"));
        break;
      default:
        setBgImage(require("./assets/default.jpg"));
    }
  };

  return (
    <ImageBackground source={bgImage} style={styles.bg}>
      <View style={styles.container}>
        <Text style={styles.title}>🌎 Weather App</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter city name"
          value={city}
          onChangeText={setCity}
        />
        <Button title="Search" onPress={fetchWeatherByCity} />

        {loading && <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />}

        {weather && (
          <View style={styles.result}>
            <Text style={styles.city}>
              {weather.name}, {weather.sys.country}
            </Text>
            <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
            <Text>Condition: {weather.weather[0].description}</Text>
            <Text>Humidity: {weather.main.humidity}%</Text>
            <Text>Wind: {weather.wind.speed} m/s</Text>
          </View>
        )}

        {forecast.length > 0 && (
          <View style={styles.forecastContainer}>
            <Text style={styles.subtitle}>⏳ Forecast</Text>
            <FlatList
              horizontal
              data={forecast}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.forecastItem}>
                  <Text>{new Date(item.dt_txt).getHours()}:00</Text>
                  <Text>{Math.round(item.main.temp)}°C</Text>
                  <Text>{item.weather[0].main}</Text>
                </View>
              )}
            />
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
  },
  input: {
    width: "100%",
    padding: 10,
    borderColor: "#90caf9",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  result: {
    marginTop: 20,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 20,
    borderRadius: 10,
  },
  city: {
    fontSize: 22,
    fontWeight: "bold",
  },
  temp: {
    fontSize: 40,
    fontWeight: "bold",
    marginVertical: 10,
  },
  forecastContainer: {
    marginTop: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  forecastItem: {
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 10,
    marginRight: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});
