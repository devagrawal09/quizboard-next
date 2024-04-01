import usePartySocket from "partysocket/react";
import { useState } from "react";
import { State, Action } from ".";

export const useQuizboard = ({
  name,
  room,
}: {
  name: string;
  room: string;
}) => {
  const [state, setState] = useState<State>({
    participants: [],
    activeParticipant: "",
  });
  const socket = usePartySocket({
    host: `localhost:1999`,
    room,
    query: { participantName: name },
    onMessage(event) {
      const message = JSON.parse(event.data) as State;
      setState(message);
    },
    onOpen() {
      dispatch({
        type: "JOIN",
        payload: { participantName: name },
      });
    },
  });

  function dispatch(a: Action) {
    socket.send(JSON.stringify(a));
  }

  return [state, dispatch] as const;
};
