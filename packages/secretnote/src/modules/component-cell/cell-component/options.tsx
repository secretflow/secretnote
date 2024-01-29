import { Cascader } from 'antd';
import { groupBy } from 'lodash-es';

import type { ComponentSpec } from '@/components/component-form';

import components from './component.json';

type ComponentOptionType = {
  label: string;
  value: string;
  children: ComponentOptionType[];
  component?: ComponentSpec;
};

const transformComponentsToOptions = (componentSpecs: ComponentSpec[]) => {
  const options: ComponentOptionType[] = [];
  const componentByDomain = groupBy(componentSpecs, 'domain');
  Object.keys(componentByDomain).forEach((domain) => {
    const domainComponents = componentByDomain[domain];
    const domainOptions: ComponentOptionType = {
      value: domain,
      label: domain,
      children: [],
    };

    const componentByName = groupBy(domainComponents, 'name');
    Object.keys(componentByName).forEach((name) => {
      const nameComponents = componentByName[name];
      const nameOptions: ComponentOptionType = {
        value: name,
        label: name,
        children: [],
      };

      nameComponents.forEach((component) => {
        nameOptions.children.push({
          value: component.version,
          label: component.version,
          component,
          children: [],
        });
      });

      domainOptions.children.push(nameOptions);
    });

    options.push(domainOptions);
  });

  return options;
};

const componentsOptions = transformComponentsToOptions(
  components.comps as ComponentSpec[],
);

const getComponentByIds = (id: string[]) => {
  const [domain, name, version] = id;
  const component = components.comps.find(
    (c) => c.domain === domain && c.name === name && c.version === version,
  );
  return component as ComponentSpec;
};

const getComponentIds = (component: ComponentSpec) => {
  return [component.domain, component.name, component.version];
};

const ComponentOptions = ({
  component,
  onComponentChange,
}: {
  component?: ComponentSpec;
  onComponentChange?: (component: ComponentSpec) => void;
}) => {
  return (
    <Cascader
      popupClassName="component-cascader"
      size="small"
      options={componentsOptions}
      value={component ? [component.domain, component.name, component.version] : []}
      onChange={(value, selectedOptions) => {
        const c = selectedOptions?.[selectedOptions.length - 1]?.component;
        if (c && onComponentChange) {
          onComponentChange(c);
        }
      }}
      placeholder="Please select a component first."
    />
  );
};

export { ComponentOptions, getComponentByIds, getComponentIds };
