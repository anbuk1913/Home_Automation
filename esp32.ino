#include<WiFi.h>
#include<HTTPClient.h>
#include<ArduinoJson.h>

const char* ssid = "Airtel_7904030785";
const char* password = "password";

const char* serverURL = "http://192.168.1.20:1913";
const String userid = "68b53d1807c5a83e90871457";
const String roomid = "68b53d4407c5a83e90871465";

struct PinMapping {
    String pinId;
    int gpioPin;
    bool currentState;
};


PinMapping pinMappings[] = {
    {"68b53d4407c5a83e90871467", 15, false},
    {"68b53d4407c5a83e90871468", 2, false},
    {"68b53d4407c5a83e90871469", 4, false},
    {"68b53d4407c5a83e9087146a", 18, false},
    {"68b53d4407c5a83e9087146b", 19, false},
    {"68b53d4407c5a83e9087146c", 22, false},
    {"68b53d4407c5a83e9087146d", 23, false},
    {"68b53d4407c5a83e9087146e", 12, false},
    {"68b53d4407c5a83e9087146f", 14, false},
    {"68b53d4407c5a83e90871470", 26, false},
};


const int numPins = sizeof(pinMappings) / sizeof(pinMappings[0]);

unsigned long lastUpdate = 0;
const unsigned long updateInterval = 2000;

void setup(){
    Serial.begin(115200);
    for(int i=0;i<numPins;i++){
        pinMode(pinMappings[i].gpioPin, OUTPUT);
        digitalWrite(pinMappings[i].gpioPin, LOW);
        Serial.println("GPIO " + String(pinMappings[i].gpioPin) + " initialized for pin ID: " + pinMappings[i].pinId);
    }
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    while(WiFi.status() != WL_CONNECTED){
        delay(500);
        Serial.print(".");
    }
    Serial.println();
    Serial.println("WiFi connected!");
    Serial.println("IP address: " + WiFi.localIP().toString());
}

void loop(){
    if(WiFi.status() != WL_CONNECTED){
        Serial.println("WiFi disconnected. Reconnecting...");
        WiFi.begin(ssid, password);
        while(WiFi.status() != WL_CONNECTED){
        delay(500);
        Serial.print(".");
        }
        Serial.println("WiFi reconnected!");
    }
    
    if(millis() - lastUpdate >= updateInterval){
        updatePinStates();
        lastUpdate = millis();
    }
    delay(100);
}

void updatePinStates(){
    if (WiFi.status() == WL_CONNECTED){
        HTTPClient http;
        String endpoint = String(serverURL) + "/getdata/" + userid + "/" + roomid;
        http.begin(endpoint);
        http.addHeader("Content-Type", "application/json");
        Serial.println("Requesting: " + endpoint);
        int httpResponseCode = http.POST("");
        if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.println("HTTP Response: " + String(httpResponseCode));
        Serial.println("Response: " + response);
        
        if (httpResponseCode == 200) {
            parseAndUpdatePins(response);
        } else {
            Serial.println("Error: " + response);
        }
        } else {
        Serial.println("HTTP Request failed. Error: " + String(httpResponseCode));
        }
        http.end();
    } else {
        Serial.println("WiFi not connected");
    }
}

void parseAndUpdatePins(String jsonResponse){
    DynamicJsonDocument doc(2048);
    DeserializationError error = deserializeJson(doc, jsonResponse);
    if(error){
        Serial.println("JSON parsing failed: " + String(error.c_str()));
        return;
    }
    
    if(!doc["success"].as<bool>()){
        Serial.println("API request unsuccessful: " + doc["message"].as<String>());
        return;
    }
    
    JsonArray pins = doc["room"]["pins"];
    
    if(pins.size() == 0){
        Serial.println("No pins found in response");
        return;
    }
    
    Serial.println("Processing " + String(pins.size()) + " pins:");
    
    for (JsonObject pin : pins) {
        String pinId = pin["_id"].as<String>();
        bool pinState = pin["state"].as<bool>();
        String pinName = pin["name"].as<String>();    
        Serial.println("Pin: " + pinName + " (ID: " + pinId + ") - State: " + String(pinState));
        updateGPIOPin(pinId, pinState);
    }
}

void updateGPIOPin(String pinId, bool newState){
    for(int i=0;i<numPins;i++){
        if(pinMappings[i].pinId == pinId){
            if(pinMappings[i].currentState != newState){
                pinMappings[i].currentState = newState;
                digitalWrite(pinMappings[i].gpioPin, newState ? HIGH : LOW);
                // Serial.println("Updated GPIO " + String(pinMappings[i].gpioPin) + " to " + String(newState ? "HIGH" : "LOW") + " for pin ID: " + pinId);
            }
        return;
        }
    }
    Serial.println("Warning: Pin ID " + pinId + " not found in mappings");
}