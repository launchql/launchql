#!/usr/bin/env node

import { getEnvOptions } from '@launchql/types';
import { LaunchQLExplorer as server } from './server';

server(getEnvOptions());