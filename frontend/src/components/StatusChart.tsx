import { ResponsiveContainer, PieChart, Pie, Cell, Label } from "recharts";
import { ChartContainer } from "./ui/chart";
import { useEffect, useState } from "react";

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
    mobile: {
        label: "Mobile",
        color: "hsl(var(--chart-2))",
    },
}

function StatusChart({ chartData: initialData, position: initialPosition = "left", sign = "°" }: { chartData: { name: string, value: number, fill: string }[], position?: "left" | "right", sign: "°" | "%" }) {
    const [chartData, setChartData] = useState(initialData);
    const [alignment, setAlignment] = useState([-90, 90, 15]);
    const [chartMargin, setChartMargin] = useState("ml-[100px]");

    useEffect(() => {
        setChartData(initialData);

        if (initialPosition == "left") {
            setAlignment([270, 90, 20])
            setChartMargin("ml-[-150px]")
        } else if (initialPosition == "right") {
            setAlignment([-90, 90, -20])
            setChartMargin("ml-[150px]")
        }
    }, [initialData, initialPosition]);

    return (
        <ChartContainer config={chartConfig} className={`absolute min-h-[500px] ${chartMargin}`}>
            <ResponsiveContainer width={"100%"} height={"100%"}>
                <PieChart>
                    <Pie
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
                        dataKey="value"
                        data={chartData}
                        startAngle={alignment[0]}
                        endAngle={alignment[1]}
                        innerRadius={130}
                        cornerRadius={99}
                    >
                        {
                            chartData.map((entry, index) => (
                                <Cell
                                    key={(index + 1).toString()}
                                    fill={entry.fill}
                                />
                            ))
                        }
                        <Label
                            content={({ viewBox }) => {
                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                    return (
                                        <text
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            <tspan
                                                // @ts-ignore
                                                x={viewBox.cx - alignment[2]} // @ts-ignore
                                                y={viewBox.cy + 3}
                                                className="text-7xl font-bold fill-white"
                                            >
                                                {chartData[0].value.toString() + sign}
                                            </tspan>
                                        </text>
                                    )
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