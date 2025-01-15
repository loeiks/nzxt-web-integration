package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	"github.com/shirou/gopsutil/cpu"
)

type CPUInfo struct {
	Temperature float64 `json:"temperature"`
	Usage       float64 `json:"usage"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins
	},
}

func getCPUInfo() (CPUInfo, error) {
	percentages, err := cpu.Percent(time.Second, false)
	if err != nil {
		return CPUInfo{}, err
	}

	temperature, err := getCPUTemperature()
	if err != nil {
		log.Printf("Error Fetching CPU Temperature: %v", err)
		return CPUInfo{}, err
	}

	return CPUInfo{
		Temperature: temperature,
		Usage:       percentages[0],
	}, nil
}

func getCPUTemperature() (float64, error) {
	data, err := os.ReadFile("/sys/class/thermal/thermal_zone0/temp")
	if err != nil {
		return 0, fmt.Errorf("failed to read cpu temperature: %w", err)
	}

	tempStr := strings.TrimSpace(string(data))
	tempMilliCelsius, err := strconv.Atoi(tempStr)
	if err != nil {
		return 0, fmt.Errorf("failed to convert temprature to integer: %w", err)
	}

	return float64(tempMilliCelsius) / 1000.0, nil
}

// wsHandler handles WebSocket connections and sends real-time CPU data
func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to Upgrade Connection: %v\n", err)
		return
	}

	go handleWebSocketConnection(conn)
}

func handleWebSocketConnection(conn *websocket.Conn) {
	defer conn.Close()

	log.Println("New WebSocket client connected")

	// Create a ticker for periodic updates
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	// Create a channel to signal when the connection is closed
	done := make(chan struct{})

	// Set a close handler to signal when the connection is closed
	conn.SetCloseHandler(func(code int, text string) error {
		log.Println("WebSocket Client Disconnected")
		close(done) // Signal that the connection is closed
		return nil
	})

	for {
		select {
		case <-ticker.C:
			cpuInfo, err := getCPUInfo()
			if err != nil {
				log.Printf("Error Fetching CPU Info: %v\n", err)
				continue
			}

			err = conn.WriteJSON(cpuInfo)
			if err != nil {
				log.Printf("Error Sending Data to Client: %v\n", err)
				return
			}
		case <-done:
			return
		}
	}
}

// Start WS Server
func main() {
	http.HandleFunc("/cpu", wsHandler)
	port := ":8080"

	log.Printf("Starting WebSocket server on port %s...\n", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatalf("Server failed to start: %v\n", err)
	}
}
