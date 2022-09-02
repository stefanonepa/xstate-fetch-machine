import { createMachine, interpret, assign } from "xstate";
import "./styles.css";

document.getElementById("app").innerHTML = `
<h1>XState TypeScript Example</h1>
<div>
  Open the <strong>Console</strong> to view the machine output.
  <button id="retry-btn">retry</button>
</div>
`;


interface Context {
    retries: number;
}

const btn = document.getElementById("retry-btn");
const fetchMachine = createMachine<Context>({
    id: "fetch",
    initial: "idle",
    context: {
        retries: 0
    },
    states: {
        idle: {
            on: {
                FETCH: "loading"
            }
        },
        loading: {
            invoke: {
                src: () => {
                    return Promise.reject();
                    // return fetch("https://fakeapi.andreaspabst.com/api/todos")
                    //   .then((response) => response.json())
                    //   .then((json) => console.log(json));
                },
                onDone: "success",
                onError: "failure"
            }
        },
        success: {
            type: "final",
            entry: () => {
                console.log("success entered");
            }
        },
        failure: {
            on: {
                RETRY: {
                    target: "loading",
                    actions: assign({
                        retries: (context, event) => context.retries + 1
                    })
                }
            },
            entry: () => {
                console.log("failure entered");
            }
        }
    }
});

const service = interpret(fetchMachine).onTransition((state) => {
    console.log(`CURRENT STATE: ${state.value}`);
    console.log(`RETRIES: ${state.context.retries}`);
});

service.start();

service.send("FETCH");
setTimeout(() => {
    service.send("RETRY");
}, 0);

btn.addEventListener("click", () => {
    console.log("clicked");
    service.send("RETRY");
});
