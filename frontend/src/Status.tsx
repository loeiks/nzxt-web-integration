import { useState, useEffect, useCallback, useRef } from 'react';
import StatusChart from './components/StatusChart';
import { MonitoringData } from '@nzxt/web-integrations-types/v1';
import axios from 'axios';

const Status = () => {
    const [pcData, setPcData] = useState<{
        temp: { value: number; fill: string }[];
        usage: { value: number; fill: string }[];
    } | null>(null);

    const [s1Data, setS1Data] = useState<{
        temp: { value: number; fill: string }[];
        usage: { value: number; fill: string }[];
    } | null>(null);

    const [currentData, setCurrentData] = useState<{
        temp: { value: number; fill: string }[];
        usage: { value: number; fill: string }[];
    } | null>(null);

    const [currentState, setCurrentState] = useState<"PC" | "S1">("PC");
    
    const stateIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const callIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleMonitoringDataUpdate = useCallback(
        (data: MonitoringData) => {
            const { cpus } = data;

            if (
                !pcData ||
                pcData.temp[0].value !== (cpus[0]?.temperature ?? 0) ||
                pcData.usage[0].value !== (cpus[0]?.load ?? 0)
            ) {
                setPcData({
                    temp: [
                        {
                            value: Number(cpus[0]?.temperature?.toFixed(0)),
                            fill: 'hsl(var(--chart-1))',
                        },
                        {
                            value: 100 - Number(cpus[0]?.temperature?.toFixed(0)),
                            fill: 'hsl(var(--chart-2))',
                        },
                    ],
                    usage: [
                        {
                            value: Number(((cpus[0].load || 0) * 100).toFixed(0)),
                            fill: 'hsl(var(--chart-1))',
                        },
                        {
                            value: 100 - Number(((cpus[0].load || 0) * 100).toFixed(0)),
                            fill: 'hsl(var(--chart-2))',
                        },
                    ],
                });
            }
        },
        [pcData]
    );

    useEffect(() => {
        window.nzxt = {
            v1: {
                onMonitoringDataUpdate: handleMonitoringDataUpdate,
                height: 640,
                width: 640,
                shape: 'circle',
                targetFps: 30,
            },
        };
    }, [handleMonitoringDataUpdate]);

    // Animate State in Every 10s (useEffect for performance and unexpected breakage)
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (currentState === "PC") {
                setCurrentState("S1");
            } else {
                setCurrentState("PC")
            }
        }, 10 * 1000)

        stateIntervalRef.current = intervalId;

        return () => {
            if (stateIntervalRef.current) {
                clearInterval(stateIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (currentState === "PC") {
            setCurrentData(pcData);
        } else if (currentState === "S1") {
            setCurrentData(s1Data);
        }
    }, [currentState])

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (currentState === "S1") {
                    const response = await axios.get('/api/cpu');
                    setS1Data(response.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        const intervalId = setInterval(fetchData, 1000);
        callIntervalRef.current = intervalId;

        fetchData();

        return () => {
            if (callIntervalRef.current) {
                clearInterval(callIntervalRef.current);
            }
        };
    }, []);

    return (
        <div className="flex flex-row items-center justify-center h-[100vh]">
            {
                currentData ? (
                    <>
                        <div className='grid grid-cols-[auto,1fr,auto] h-auto items-center gap-[30px]'>
                            <div className='col-start-1 col-end-2 place-self-center'>
                                <StatusChart chartData={currentData.temp} position="left" sign="°" />
                            </div>
                            <h1 className='col-start-2 place-self-center text-5xl text-white font-bold text-center mb-[18px] min-w-[20px]'>{currentState}</h1>
                            <div className='col-start-3 col-end-4 place-self-center'>
                                <StatusChart chartData={currentData.usage} position="right" sign="%" />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center text-white text-xl font-sans font-normal">Loading...</div>
                )
            }
        </div>
    );
};

export default Status;