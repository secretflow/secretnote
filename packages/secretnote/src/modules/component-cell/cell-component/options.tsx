import { Cascader } from 'antd';
import { groupBy } from 'lodash-es';

import type { ComponentSpec } from '@/components/component-spec-form';

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

const ComponentOptions = ({
  onComponentChange,
}: {
  onComponentChange: (component: ComponentSpec) => void;
}) => {
  return (
    <Cascader
      popupClassName="component-cascader"
      size="small"
      options={transformComponentsToOptions(components.comps as ComponentSpec[])}
      onChange={(value, selectedOptions) => {
        const component = selectedOptions?.[selectedOptions.length - 1]?.component;
        if (component) {
          onComponentChange(component);
        }
      }}
      placeholder="Please select a component first."
    />
  );
};

export { ComponentOptions };
