interface IProps {
  classNameTitle?: string;
  classNameSub?: string;
  onClick?: () => void;
}

export const Logo = ({
  classNameTitle = "text-2xl",
  classNameSub = "text-xs",
  onClick,
}: IProps) => (
  <button
    type="button"
    onClick={onClick}
    className="realm-brand"
    aria-label="mmo-portal home"
  >
    <span className={`realm-brand-title ${classNameTitle}`}>mmo-portal</span>
    <span className={`realm-brand-sub ${classNameSub}`}>
      <i />
      Forge your legend
      <i />
    </span>
  </button>
);
