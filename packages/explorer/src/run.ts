#!/usr/bin/env node

import { getEnvOptions } from '@pgpmjs/env';

import { LaunchQLExplorer as server } from './server';

server(getEnvOptions());
