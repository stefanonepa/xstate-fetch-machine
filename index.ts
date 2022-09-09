import { createMachine, interpret, assign } from 'xstate';
import { log } from 'xstate/lib/actions';
import './styles.css';

document.getElementById('app').innerHTML = `
<h1>XState TypeScript Example</h1>
<div>
  Open the <strong>Console</strong> to view the machine output.
  <button id="retry-btn">retry</button>
</div>
`;

interface Context {
  retries: number;
}

const btn = document.getElementById('retry-btn');

const fetchMachineBase: any = {
  id: 'fetch',
  initial: 'idle',
  context: {
    retries: 0,
  },
  states: {
    idle: {
      on: {
        FETCH: 'loading',
      },
    },
    loading: {
      invoke: {
        src: "fetchSomething",
        onDone: 'success',
        onError: 'failure',
      },
    },
    success: {
      type: 'final',
      entry: "logCurrentState",
    },
    failure: {
      on: {
        RETRY: [{
          target: "warning",
          cond: "retryWarningLimitReached"
        },{
          target: 'loading',
          cond: "retryLimitreached"
        },{
          target: "error"
        }]
      },
      entry: ["logCurrentState","incrementRetries"],
    },
    warning:{
      always: "loading",
      entry: "showWarning"
    },
    error:{
      type: "final",
      entry: "showError"
    }
  },
};

const fetchMachineConfig = {
    actions: {
      incrementRetries: assign({
        retries: (context: any, event) => context.retries + 1,
      }),
      logCurrentState: (context, event) => {
        // console.log(`${context.} entered`);
        console.log(context, event)
      },
      showError: ()=>{
        //alert("arrggh!")
      },
      showWarning: ()=>{
        //alert("carefull!!!")
      }
    },
    guards: {
      retryLimitreached:(context) => { 
        return context.retries < 10
      },
      retryWarningLimitReached: (context) => { 
        return context.retries < 10 && context.retries >= 5
      },
    },
    services: {
      fetchSomething: () => {
        return Promise.reject();
        // return Promise.resolve({});
      }
    }
  };

const fetchMachine = createMachine<any, any>(fetchMachineBase);
const service = interpret(fetchMachine.withConfig(fetchMachineConfig)).onTransition((state) => {
  console.log(`CURRENT STATE: ${state.value}`);
  console.log(`RETRIES: ${state.context.retries}`);
});

service.start();

service.send('FETCH');
setTimeout(() => {
  service.send('RETRY');
}, 0);

btn?.addEventListener('click', () => {
  console.log('clicked');
  service.send('RETRY');
});
