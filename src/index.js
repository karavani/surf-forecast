import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';

import rootReducer from './reducers';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

const store = createStore(rootReducer, applyMiddleware(thunk));

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
