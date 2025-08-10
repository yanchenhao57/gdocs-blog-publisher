import { useSocketContext } from "@/contexts/SocketContext";

const SocketEventLog = () => {
    const { connectionStatus, isConnected, connect, disconnect, reconnect } = useSocketContext();
    return <div>
        <button onClick={connect}>Connect</button>
        <button onClick={disconnect}>Disconnect</button>
        <button onClick={reconnect}>Reconnect</button>
        <h1>SocketEventLog</h1>
        <p>Connection Status: {connectionStatus}</p>
        <p>Is Connected: {isConnected ? 'Yes' : 'No'}</p>
    </div>;
};

export default SocketEventLog;