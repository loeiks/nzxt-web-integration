import { ResponsiveContainer, PieChart, Pie, Cell, Label } from "recharts";
import { ChartContainer } from "./ui/chart";
import { useSelector } from 'react-redux';
import { RootState } from "../store";

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
    mobile: {
        label: "Mobile",
        color: "hsl(var(--chart-2))",
    }
};

type StatusChartType = { sign: "°" | "%" };

function StatusChart({ sign }: StatusChartType) {
    // If sign is ° it's mean we are showing temp and it should stay on left side.
    const alignment = sign === "°" ? [270, 90, 24] : [-90, 90, -24];
    const currentCx = sign === "°" ? "96%" : "6%";

    const { currentSource, pcData, s1Data } = useSelector((state: RootState) => state.cpu);
    const { temp, usage } = currentSource === "PC" ? pcData : s1Data;
    const currentData = sign === "°" ? temp : usage;

    const chartData = [
        { value: (currentData < 7 ? 7 : currentData), fill: "hsl(var(--chart-1))" },
        { value: (100 - currentData), fill: "hsl(var(--chart-2))" },
    ];

    const renderLabel = ({ viewBox }: any) => {
        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
            return (
                <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                >
                    <tspan
                        x={viewBox.cx - alignment[2]}
                        y={viewBox.cy + 3}
                        className="text-7xl font-bold fill-white text-center"
                    >
                        {currentData.toString() + sign}
                    </tspan>
                </text>
            );
        }
        return null;
    }

    return (
        <ChartContainer config={chartConfig} className={`min-h-[500px]`}>
            <ResponsiveContainer height={"100%"} debounce={2000}>
                <PieChart width={500}>
                    <Pie
                        cx={currentCx}
                        dataKey="default"
                        data={[{ default: 100 }]}
                        startAngle={alignment[0]}
                        endAngle={alignment[1]}
                        innerRadius={130}
                        cornerRadius={10}
                        animationDuration={700}
                        animationEasing="ease-in-out"
                    >
                        <Cell fill="hsl(var(--chart-2))" />
                    </Pie>
                    <Pie
                        cx={currentCx}
                        dataKey="value"
                        data={chartData}
                        startAngle={alignment[0]}
                        endAngle={alignment[1]}
                        innerRadius={130}
                        cornerRadius={10}
                        animationDuration={500}
                        animationEasing="ease-in-out"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={(index + 1).toString()} fill={entry.fill} />
                        ))}
                        <Label content={renderLabel} />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}

export default StatusChart;