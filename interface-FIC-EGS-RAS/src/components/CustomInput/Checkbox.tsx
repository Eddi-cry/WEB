import './CustomInput.scss';

type CheckboxProps = {
  checked: boolean;
  onChange: () => void;
  content: string;
};

function Checkbox({ checked, onChange, content }: CheckboxProps) {
  return (
    <label className='checkbox__label'>
      <input type='checkbox' className='checkbox__input' checked={checked} onChange={onChange} />
      {content}
    </label>
  );
}

export default Checkbox;
