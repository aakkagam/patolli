import { mount } from 'svelte';
import App from './lib/components/App.svelte';

const target = document.getElementById('app');
if (!target) throw new Error('Missing #app mount point');

export default mount(App, { target });
