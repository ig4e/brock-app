import React from "react";
import type { SelectProps } from "tamagui";
import { Adapt, Select as SelectPrimitive } from "tamagui";

const Select: typeof SelectPrimitive = (({
  children,
  ...props
}: SelectProps) => {
  return (
    <SelectPrimitive {...props}>
      {children}
      <Adapt when="sm" platform="touch">
        <SelectPrimitive.Sheet
          modal
          dismissOnSnapToBottom
          animationConfig={{
            type: "spring",
            damping: 20,
            mass: 1.2,
            stiffness: 250,
          }}
          snapPointsMode="fit"
        >
          <SelectPrimitive.Sheet.Frame>
            <SelectPrimitive.Sheet.ScrollView>
              <Adapt.Contents />
            </SelectPrimitive.Sheet.ScrollView>
          </SelectPrimitive.Sheet.Frame>
          <SelectPrimitive.Sheet.Overlay
            animation={"75ms"}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </SelectPrimitive.Sheet>
      </Adapt>
    </SelectPrimitive>
  );
}) as unknown as typeof SelectPrimitive;

Select.Trigger = SelectPrimitive.Trigger;
Select.Item = SelectPrimitive.Item;
Select.ItemText = SelectPrimitive.ItemText;
Select.Content = SelectPrimitive.Content;
Select.ScrollUpButton = SelectPrimitive.ScrollUpButton;
Select.ScrollDownButton = SelectPrimitive.ScrollDownButton;
Select.Value = SelectPrimitive.Value;
Select.Viewport = SelectPrimitive.Viewport;
Select.Group = SelectPrimitive.Group;
Select.Group = SelectPrimitive.Group;
Select.Label = SelectPrimitive.Label;
Select.ItemIndicator = SelectPrimitive.ItemIndicator;

export { Select, SelectPrimitive };
