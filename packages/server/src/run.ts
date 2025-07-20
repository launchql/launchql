#!/usr/bin/env node

import { getEnvOptions } from '@launchql/types';

import { LaunchQLServer as server } from './server';

server(getEnvOptions());
