import { useReducer } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { useQuizboard } from "../../party/client";

export default function Board({
  name,
  room,
  logout,
}: {
  name: string;
  room: string;
  logout: () => void;
}) {
  const [state, dispatch] = useQuizboard({ name, room });
  console.log(state);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-24 py-12">
      <button
        onClick={logout}
        className="self-end bg-red-500 p-2 rounded-md hover:bg-red-700 focus:outline-none"
      >
        Logout
      </button>

      <div>
        <button
          onClick={() =>
            dispatch({
              type: `PRESS_BUZZER`,
              payload: { participantName: name },
            })
          }
          className="self-center mt-10 mb-10 bg-yellow-500 hover:bg-yellow-600 focus:bg-yellow-700 text-white text-3xl px-10 py-10 rounded-full transition-colors focus:outline-none disabled:bg-gray-500
        "
          disabled={!!state.activeParticipant}
        >
          Buzzer
        </button>
        <button
          onClick={() => dispatch({ type: `RESET_BUZZER` })}
          className="self-center mt-10 mb-10 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 text-white text-3xl px-10 py-10 rounded-full transition-colors focus:outline-none disabled:bg-gray-500"
          disabled={!state.activeParticipant}
        >
          Reset Buzzer
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl w-full">
        {state.participants.map((participant, index) => (
          <div
            key={index}
            className={`flex flex-col items-center justify-center py-8 px-4 border border-gray-300 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow gap-4 ${
              participant.name === state.activeParticipant
                ? " bg-yellow-200 shadow-yellow-800"
                : ""
            }`}
          >
            <h3 className="mt-4 text-xl font-semibold text-black">
              {participant.name}
            </h3>

            <div
              className="flex text-2xl"
              title={participant.points + " points"}
            >
              <TransitionGroup className="demo-transition">
                {Array(Math.abs(participant.points))
                  .fill("")
                  .map((_, i) => (
                    <CSSTransition
                      key={i}
                      timeout={1000}
                      classNames="demo-transition"
                    >
                      <span>{participant.points >= 0 ? "🥥" : "❌"}</span>
                    </CSSTransition>
                  ))}
              </TransitionGroup>
            </div>

            <div className="flex text-2xl">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  dispatch({
                    type: `INC_POINTS`,
                    payload: { index },
                  });
                }}
                className="bg-green-500 text-white px-4 py-1 rounded-l hover:bg-green-700 focus:outline-none"
              >
                +
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  dispatch({
                    type: `DEC_POINTS`,
                    payload: { index },
                  });
                }}
                className="bg-red-500 text-white px-4 py-1 rounded-r hover:bg-red-700 focus:outline-none"
              >
                -
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
