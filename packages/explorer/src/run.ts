#!/usr/bin/env node

import { getEnvOptions } from '@launchql/env';

import { LaunchQLExplorer as server } from './server';

server(getEnvOptions());
