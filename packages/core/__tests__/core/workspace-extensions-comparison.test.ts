process.env.LAUNCHQL_DEBUG = 'true';

import { LaunchQLProject } from '../../src/core/class/launchql';
import { resolveExtensionDependencies } from '../../src/resolution/deps';
import { TestFixture } from '../../test-utils';

let fixture: TestFixture;

beforeAll(() => {
  fixture = new TestFixture('sqitch');
});

afterAll(() => {
  fixture.cleanup();
});

describe('getWorkspaceExtensionsInDependencyOrder vs simplified approach', () => {
  it('compares current implementation vs simplified resolveExtensionDependencies approach', () => {
    const workspacePath = fixture.getFixturePath('simple-w-tags');
    const project = new LaunchQLProject(workspacePath);
    
    const currentOutput = project.resolveWorkspaceExtensionDependencies();
    
    const modules = project.getModuleMap();
    const allModuleNames = Object.keys(modules);
    const virtualModuleName = '_virtual/workspace';
    const virtualModuleMap = {
      ...modules,
      [virtualModuleName]: {
        requires: allModuleNames
      }
    };
    
    const { resolved, external } = resolveExtensionDependencies(virtualModuleName, virtualModuleMap);
    const simplifiedOutput = {
      resolved: resolved.filter(name => name !== virtualModuleName),
      external: external
    };
    
    expect({
      current: currentOutput,
      simplified: simplifiedOutput,
      differences: {
        resolvedArraysIdentical: JSON.stringify(currentOutput.resolved) === JSON.stringify(simplifiedOutput.resolved),
        externalArraysIdentical: JSON.stringify(currentOutput.external) === JSON.stringify(simplifiedOutput.external),
        resolvedLengthDiff: currentOutput.resolved.length - simplifiedOutput.resolved.length,
        externalLengthDiff: currentOutput.external.length - simplifiedOutput.external.length,
        resolvedOrderingDifferences: findOrderingDifferences(currentOutput.resolved, simplifiedOutput.resolved),
        externalOrderingDifferences: findOrderingDifferences(currentOutput.external, simplifiedOutput.external)
      }
    }).toMatchSnapshot();
  });

  it('tests with different fixture types to ensure consistency', () => {
    const fixtures = ['simple', 'simple-w-tags', 'launchql'];
    
    for (const fixtureName of fixtures) {
      const workspacePath = fixture.getFixturePath(fixtureName);
      const project = new LaunchQLProject(workspacePath);
      
      const currentOutput = project.resolveWorkspaceExtensionDependencies();
      
      const modules = project.getModuleMap();
      const allModuleNames = Object.keys(modules);
      const virtualModuleName = '_virtual/workspace';
      const virtualModuleMap = {
        ...modules,
        [virtualModuleName]: {
          requires: allModuleNames
        }
      };
      
      const { resolved, external } = resolveExtensionDependencies(virtualModuleName, virtualModuleMap);
      const simplifiedOutput = {
        resolved: resolved.filter(name => name !== virtualModuleName),
        external: external
      };
      
      const areIdentical = 
        JSON.stringify(currentOutput.resolved) === JSON.stringify(simplifiedOutput.resolved) &&
        JSON.stringify(currentOutput.external) === JSON.stringify(simplifiedOutput.external);
      
      console.log(`Fixture ${fixtureName}: Current and simplified outputs are ${areIdentical ? 'IDENTICAL' : 'DIFFERENT'}`);
      
      if (!areIdentical) {
        console.log(`  Resolved differences:`, findOrderingDifferences(currentOutput.resolved, simplifiedOutput.resolved));
        console.log(`  External differences:`, findOrderingDifferences(currentOutput.external, simplifiedOutput.external));
      }
    }
  });
});

function findOrderingDifferences(arr1: string[], arr2: string[]): { onlyInFirst: string[], onlyInSecond: string[], differentPositions: Array<{item: string, pos1: number, pos2: number}> } {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  
  const onlyInFirst = arr1.filter(item => !set2.has(item));
  const onlyInSecond = arr2.filter(item => !set1.has(item));
  
  const differentPositions: Array<{item: string, pos1: number, pos2: number}> = [];
  for (const item of arr1) {
    const pos1 = arr1.indexOf(item);
    const pos2 = arr2.indexOf(item);
    if (pos2 !== -1 && pos1 !== pos2) {
      differentPositions.push({ item, pos1, pos2 });
    }
  }
  
  return { onlyInFirst, onlyInSecond, differentPositions };
}
