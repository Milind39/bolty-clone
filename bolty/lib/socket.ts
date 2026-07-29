import { io } from "socket.io-client";

// This ensures only one socket connection exists globally across your frontend client
export const socket = io("http://localhost:5000", {
  autoConnect: true,
});