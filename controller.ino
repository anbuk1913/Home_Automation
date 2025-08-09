#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "Airtel_7904030785";
const char* password = "air46278";
const char* serverName = "http://192.168.1.14:2000/data";

void setup(){
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.println("");
  Serial.print("Connecting to WiFi..");
  while (WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected to WiFi");
  sendData();
}

void loop(){

}

void sendData(){
  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type","application/json");
    String jsonData = "{\"temperature\": 25.5, \"humidity\": 60}";
    int httpResponseCode = http.POST(jsonData);
    if(httpResponseCode > 0){
      String response = http.getString();
      Serial.println("Server response: " + response);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
}




#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

const char* ssid = "Airtel_7904030785";
const char* password = "air46278";
const char* serverName = "http://192.168.1.14:2000/data";

WiFiClient client;

void setup(){
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while(WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
  sendData();
}

void loop() {
  
}

void sendData(){
  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    http.begin(client, serverName);
    http.addHeader("Content-Type", "application/json");
    String jsonData = "{\"temperature\": 25.5, \"humidity\": 60}";
    int httpResponseCode = http.POST(jsonData);
    if(httpResponseCode > 0){
      String response = http.getString();
      Serial.println("Server response: " + response);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
}
