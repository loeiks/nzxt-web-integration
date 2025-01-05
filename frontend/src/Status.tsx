import StatusChart from "./components/StatusChart";

const chartData = [
    { name: "CPU Temp", value: 20, fill: "hsl(var(--chart-1))" },
    { name: "undefined", value: 80, fill: "hsl(var(--chart-2))" }
]

function Status() {
    return (
        <div className="flex flex-row items-center justify-center h-[100vh]">
            <StatusChart chartData={chartData} position="left" sign="°" />
            <StatusChart chartData={chartData} position="right" sign="%" />
        </div>
    )
}

export default Status;