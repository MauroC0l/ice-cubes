function MyFont({ children, style }) {
  return (
    <span style={{ fontFamily: 'Arial', ...style }}>
      {children}
    </span>
  );
}

export default MyFont;