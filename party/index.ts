import type * as Party from "partykit/server";

export interface Participant {
  name: string;
  points: number;
}

export interface State {
  participants: Participant[];
  activeParticipant: string;
}

export type Action =
  | {
      type: "DEC_POINTS";
      payload: {
        index: number;
      };
    }
  | {
      type: "INC_POINTS";
      payload: {
        index: number;
      };
    }
  | {
      type: "PRESS_BUZZER";
      payload: {
        participantName: string;
      };
    }
  | {
      type: "RESET_BUZZER";
    }
  | {
      type: "JOIN";
      payload: {
        participantName: string;
      };
    }
  | {
      type: "LEAVE";
      payload: {
        participantName: string;
      };
    };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "DEC_POINTS":
      return {
        ...state,
        participants: state.participants.map((participant, index) =>
          index === action.payload.index
            ? { ...participant, points: participant.points - 1 }
            : participant
        ),
      };
    case "INC_POINTS":
      return {
        ...state,
        participants: state.participants.map((participant, index) =>
          index === action.payload.index
            ? { ...participant, points: participant.points + 1 }
            : participant
        ),
      };
    case "PRESS_BUZZER":
      return {
        ...state,
        activeParticipant: action.payload.participantName,
      };
    case "RESET_BUZZER":
      return {
        ...state,
        activeParticipant: "",
      };
    case "JOIN":
      const participantExists = state.participants.some(
        (participant) => participant.name === action.payload.participantName
      );

      if (!participantExists) {
        const newParticipant: Participant = {
          name: action.payload.participantName,
          points: 0,
        };
        return {
          ...state,
          participants: [...state.participants, newParticipant],
        };
      } else {
        return state;
      }
    case "LEAVE":
      return {
        ...state,
        activeParticipant:
          state.activeParticipant === action.payload.participantName
            ? ""
            : state.activeParticipant,
        participants: state.participants.filter(
          (participant) => participant.name !== action.payload.participantName
        ),
      };
    default:
      return state;
  }
}

type RoomConnection = Party.Connection<{ participantName: string }>;

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  state: State = { participants: [], activeParticipant: `` };

  static async onBeforeConnect(request: Party.Request, lobby: Party.Lobby) {
    const participantName =
      new URL(request.url).searchParams.get("participantName") ?? "";

    request.headers.set("X-User-Name", participantName);

    return request;
  }

  onConnect(conn: RoomConnection, ctx: Party.ConnectionContext) {
    console.log(
      `Connected:
        id: ${conn.id}
        room: ${this.room.id}
        url: ${new URL(ctx.request.url).pathname}`
    );
    conn.send(JSON.stringify(this.state));

    const participantName = ctx.request.headers.get("X-User-Name") ?? ``;

    conn.setState({ participantName });
  }

  async onRequest(req: Party.Request): Promise<Response> {
    if (req.method === "GET") {
      return new Response(JSON.stringify(this.state), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    throw new Error(`Invalid request method`);
  }

  onMessage(message: string, sender: RoomConnection) {
    console.log(`connection ${sender.id} sent message: ${message}`);
    const participantName = sender.state?.participantName;

    console.log(`onMessage`, participantName);

    try {
      const action: Action = JSON.parse(message);
      if (this.state) {
        this.state = reducer(this.state, action);
        this.room.broadcast(JSON.stringify(this.state));
      }
    } catch (error) {
      console.error(`Failed to parse message as action: ${error}`);
      sender.send(`Error processing your message: ${error}`);
    }
  }
}

Server satisfies Party.Worker;
