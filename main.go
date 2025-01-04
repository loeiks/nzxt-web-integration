package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/shirou/gopsutil/cpu"
)

type CPUInfo struct {
	Temperature float64 `json:"temperature"`
	Usage       float64 `json:"usage"`
}

func getCPUInfo() (CPUInfo, error) {
	// Get CPU usage percentage
	percentages, err := cpu.Percent(time.Second, false)
	if err != nil {
		return CPUInfo{}, err
	}

	temperature, err := getCPUTemperature()
	if err != nil {
		log.Fatalf("Error fetching CPU temperature: %v", err)
	}

	return CPUInfo{
		Temperature: temperature,
		Usage:       percentages[0],
	}, nil
}

func getCPUTemperature() (float64, error) {
	data, err := os.ReadFile("/sys/class/thermal/thermal_zone0/temp")
	if err != nil {
		return 0, err
	}

	tempStr := strings.TrimSpace(string(data))
	tempMilliCelsius, err := strconv.Atoi(tempStr)
	if err != nil {
		return 0, err
	}

	// Convert from millidegree Celsius to degree Celsius
	return float64(tempMilliCelsius) / 1000.0, nil
}
func cpuHandler(w http.ResponseWriter, r *http.Request) {
	cpuInfo, err := getCPUInfo()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cpuInfo)
}

func main() {
	http.HandleFunc("/cpu", cpuHandler)
	port := ":8080"

	log.Printf("Starting server on port %s...\n", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatalf("Server failed to start: %v\n", err)
	}
}
