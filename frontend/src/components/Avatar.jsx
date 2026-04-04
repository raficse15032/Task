const AVATAR_COLORS = ['#377DFF', '#0ACF83', '#FF6B6B', '#F7B731', '#A29BFE', '#FD79A8', '#6C5CE7', '#00B894'];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function Avatar({ firstName = '', lastName = '', size = 40, className = '', style = {} }) {
  const initials = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || '?';
  const bg = getAvatarColor((firstName + lastName) || '?');
  return (
    <div
      className={className}
      style={{
        width: size, height: size, borderRadius: '50%', background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: size * 0.38, color: '#fff',
        flexShrink: 0, userSelect: 'none', ...style,
      }}
    >
      {initials}
    </div>
  );
}
