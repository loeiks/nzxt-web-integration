import { ResponsiveContainer, PieChart, Pie, Cell, Label } from "recharts";
import { ChartContainer } from "./ui/chart";
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

type StatusChartType = { sign: "°" | "%", data: number };

function StatusChart({ sign, data }: StatusChartType) {
    // If sign is ° it's mean we are showing temp and it should stay on left side.
    const alignment = sign === "°" ? [270, 90, 24] : [-90, 90, -24];
    const currentCx = sign === "°" ? "96%" : "6%";

    const chartData = [
        { value: data, fill: "hsl(var(--chart-1))" },
        { value: (100 - data), fill: "hsl(var(--chart-2))" },
    ];

    return (
        <ChartContainer config={chartConfig} className={`min-h-[500px]`}>
            <ResponsiveContainer height={"100%"}>
                <PieChart width={500}>
                    <Pie
                        cx={currentCx}
                        dataKey="default"
                        data={[{ default: 100 }]}
                        startAngle={alignment[0]}
                        endAngle={alignment[1]}
                        innerRadius={130}
                        cornerRadius={99}
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
                        cornerRadius={99}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={(index + 1).toString()} fill={entry.fill} />
                        ))}
                        <Label
                            content={({ viewBox }) => {
                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                    return (
                                        <text
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            <tspan // @ts-ignore
                                                x={viewBox.cx - alignment[2]} // @ts-ignore
                                                y={viewBox.cy + 3}
                                                className="text-7xl font-bold fill-white text-center"
                                            >
                                                {data.toString() + sign}
                                            </tspan>
                                        </text>
                                    );
                                }
                            }}
                        />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}

export default StatusChart;