import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Button, ActivityIndicator } from "react-native";
import API_KEY from "@env";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );
      const data = await response.json();
      if (data.cod === 200) {
        setWeather(data);
      } else {
        setWeather(null);
        alert("City not found!");
      }
    } catch (error) {
      console.error(error);
      alert("Error fetching weather!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌦️ Weather App</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter city name"
        value={city}
        onChangeText={setCity}
      />
      <Button title="Get Weather" onPress={fetchWeather} />

      {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}

      {weather && (
        <View style={styles.result}>
          <Text style={styles.city}>{weather.name}, {weather.sys.country}</Text>
          <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
          <Text>Condition: {weather.weather[0].description}</Text>
          <Text>Humidity: {weather.main.humidity}%</Text>
          <Text>Wind: {weather.wind.speed} m/s</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
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
    backgroundColor: "#bbdefb",
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
});
