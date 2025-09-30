import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './gift-list.less';

const month = new Date().getMonth(); // 0 = Jan, 11 = Dec
const isChristmas = month === 9 || month === 10 || month === 11; // Oct, Nov, & Dec

document.body.classList.add(isChristmas ? 'christmas-theme' : 'party-theme');

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
	<StrictMode>
		<App/>
	</StrictMode>
);