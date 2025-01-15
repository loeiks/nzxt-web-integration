import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { toggleSource, updatePCData, updateS1Data, setDelayUpdate } from './store/cpuSlice';
import StatusChart from './components/StatusChart';
import { type MonitoringData } from "@nzxt/web-integrations-types/v1";

const ws = new WebSocket("http://192.168.178.18:8080/cpu");
// const ws = new WebSocket("/cpu");

const animationDurationDelay = 700;

const Status = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { currentSource, delayUpdate } = useSelector((state: RootState) => state.cpu);

    useEffect(() => {
        const intervalId = setInterval(() => {
            dispatch(toggleSource());
        }, 15000);

        return () => clearInterval(intervalId);
    }, [dispatch]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (currentSource === "S1") {
                if (delayUpdate) {
                    timeoutId = setTimeout(() => {
                        dispatch(updateS1Data({ temp: Number(data.temperature.toFixed(0)), usage: Number(data.usage.toFixed(0)) }));
                        dispatch(setDelayUpdate(false));
                    }, animationDurationDelay);
                } else {
                    dispatch(updateS1Data({ temp: Number(data.temperature.toFixed(0)), usage: Number(data.usage.toFixed(0)) }));
                }
            }
        };

        ws.addEventListener('message', handleMessage);
        ws.onclose = () => {
            console.warn("WebSocket Connection Closed!");
        };

        return () => {
            ws.removeEventListener('message', handleMessage);
            clearTimeout(timeoutId);
        };
    }, [dispatch, currentSource]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (!window.nzxt?.v1) {
            window.nzxt = {
                v1: {
                    onMonitoringDataUpdate: (data: MonitoringData) => {
                        const cpu = data.cpus[0];
                        if (currentSource === "PC") {
                            if (delayUpdate) {
                                timeoutId = setTimeout(() => {
                                    dispatch(updatePCData({ temp: Number((cpu.temperature || 0).toFixed(0)), usage: Number(((cpu.load || 0) * 100).toFixed(0)) }));
                                    dispatch(setDelayUpdate(false));
                                }, animationDurationDelay);
                            } else {
                                dispatch(updatePCData({ temp: Number((cpu.temperature || 0).toFixed(0)), usage: Number(((cpu.load || 0) * 100).toFixed(0)) }));
                            }
                        }
                    },
                    height: 640,
                    width: 640,
                    shape: "circle",
                    targetFps: 30
                }
            };
        }

        return () => {
            clearTimeout(timeoutId);
        }
    }, [dispatch])

    return (
        <div className="flex flex-row justify-center h-[100vh] w-full ml-[-11px]">
            <div className='grid grid-cols-[auto,1fr,auto] h-full items-center gap-[30px]'>
                <div className='col-start-1 col-end-2 place-self-center'>
                    <StatusChart key={`temp-${currentSource}`} sign="°" />
                </div>
                <h1 className='col-start-2 place-self-center text-5xl text-white opacity-65 text-center min-w-[24px] mb-[16px]'>{currentSource}</h1>
                <div className='col-start-3 col-end-4 place-self-center'>
                    <StatusChart key={`usage-${currentSource}`} sign="%" />
                </div>
            </div>
        </div>
    );
};

export default Status;