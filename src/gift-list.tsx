import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './gift-list.less';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
	<StrictMode>
		<App/>
	</StrictMode>
);