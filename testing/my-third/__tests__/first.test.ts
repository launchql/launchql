import { LaunchQLProject } from '@launchql/migrate';
import { resolve } from 'path';

it('LaunchQL', () => {
    const project = new LaunchQLProject(resolve(__dirname+'/../'));
    console.log(project);
});