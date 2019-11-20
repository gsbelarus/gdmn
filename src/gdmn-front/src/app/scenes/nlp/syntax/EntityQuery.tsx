import React, { useState } from "react";
import { EntityQuery, EntityLinkField } from "gdmn-orm";
import { Frame } from "../../gdmn/components/Frame";
import { Stack, getTheme, Icon } from "office-ui-fabric-react";

const ELField = ({ f }: { f: EntityLinkField }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        border: '1px solid ' + getTheme().palette.themeDarker,
        borderRadius: '2px',
        padding: '2px 4px 2px 4px'
      }}
    >
      <Stack horizontal verticalAlign='center' tokens={{ childrenGap: '4px' }}>
        <Stack.Item>
          {f.attribute.name}
        </Stack.Item>
        {
          f.links && open ?
            <Stack.Item>
              {f.links.map( l => `[${l.entity.name}=${l.alias}] `)}
            </Stack.Item>
          : null
        }
        {
          f.links ?
            <Stack.Item grow>
              <Stack verticalAlign='center'>
                <Icon
                  styles={{
                    root: {
                      transform: open ? 'none' : 'rotate(180deg)',
                      color: getTheme().palette.themePrimary
                    }
                  }}
                  iconName='SkypeCircleArrow'
                  onClick={ () => setOpen(!open) }
                />
              </Stack>
            </Stack.Item>
          : null
        }
      </Stack>
    </div>
  )
};

export const EQ = ({ eq }: { eq: EntityQuery }) => {
  return (
    <>
      <div>
        {`${eq.link.alias} -- ${eq.link.entity.name}`}
      </div>
      <Frame border marginTop caption="Fields">
        <Stack horizontal wrap tokens={{ childrenGap: '2px' }}>
          {
            eq.link.fields.map( (f, idx) => <ELField key={`${f.attribute.name}-${idx}`} f={f} /> )
          }
        </Stack>
      </Frame>
      <pre>
        {JSON.stringify(eq.inspect().options, undefined, 2)}
      </pre>
    </>
  )
};