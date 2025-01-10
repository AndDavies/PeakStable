import React from 'react';

interface SelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {}

export const SelectItem: React.FC<SelectItemProps> = (props) => {
  return <option {...props} />;
};