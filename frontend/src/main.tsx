import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import Status from './Status';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    <Status />
  </Provider>
);