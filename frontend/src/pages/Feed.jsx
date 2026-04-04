import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logoutUser, getFeed, createPost, getPostComments, createComment, getCommentReplies, createReply, likePost } from '../api/authService';

const STORAGE_BASE = 'http://37.60.248.4:8830/api/v1/images?path=';

function timeAgo(dateString) {
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

function Navbar() {
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (_) {
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
      <div className="container _custom_container">
        <div className="_logo_wrap">
          <Link className="navbar-brand" to="/feed">
            <img src="/assets/images/logo.svg" alt="Logo" className="_nav_logo" />
          </Link>
        </div>
        <button
          className="navbar-toggler bg-light"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <div className="_header_form ms-auto">
            <form className="_header_form_grp">
              <svg className="_header_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                <circle cx="7" cy="7" r="6" stroke="#666" />
                <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
              </svg>
              <input className="form-control me-2 _inpt1" type="search" placeholder="input search text" aria-label="Search" />
            </form>
          </div>
          <ul className="navbar-nav mb-2 mb-lg-0 _header_nav_list ms-auto _mar_r8">
            {/* Home */}
            <li className="nav-item _header_nav_item">
              <Link className="nav-link _header_nav_link_active _header_nav_link" to="/feed">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="21" fill="none" viewBox="0 0 18 21">
                  <path className="_home_active" stroke="#000" strokeWidth="1.5" strokeOpacity=".6" d="M1 9.924c0-1.552 0-2.328.314-3.01.313-.682.902-1.187 2.08-2.196l1.143-.98C6.667 1.913 7.732 1 9 1c1.268 0 2.333.913 4.463 2.738l1.142.98c1.179 1.01 1.768 1.514 2.081 2.196.314.682.314 1.458.314 3.01v4.846c0 2.155 0 3.233-.67 3.902-.669.67-1.746.67-3.901.67H5.57c-2.155 0-3.232 0-3.902-.67C1 18.002 1 16.925 1 14.77V9.924z" />
                  <path className="_home_active" stroke="#000" strokeOpacity=".6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.857 19.341v-5.857a1 1 0 00-1-1H7.143a1 1 0 00-1 1v5.857" />
                </svg>
              </Link>
            </li>
            {/* Friends */}
            <li className="nav-item _header_nav_item">
              <Link className="nav-link _header_nav_link" to="#">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="20" fill="none" viewBox="0 0 26 20">
                  <path fill="#000" fillOpacity=".6" fillRule="evenodd" d="M12.79 12.15h.429c2.268.015 7.45.243 7.45 3.732 0 3.466-5.002 3.692-7.415 3.707h-.894c-2.268-.015-7.452-.243-7.452-3.727 0-3.47 5.184-3.697 7.452-3.711l.297-.001h.132zm9.343-2.224c2.846.424 3.444 1.751 3.444 2.79 0 .636-.251 1.794-1.931 2.43a.882.882 0 01-1.137-.506.873.873 0 01.51-1.13c.796-.3.796-.633.796-.793 0-.511-.654-.868-1.944-1.06a.878.878 0 01-.741-.996.886.886 0 011.003-.735zM12.789 0c2.96 0 5.368 2.392 5.368 5.33 0 2.94-2.407 5.331-5.368 5.331h-.031a5.329 5.329 0 01-3.782-1.57 5.253 5.253 0 01-1.553-3.764C7.423 2.392 9.83 0 12.789 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </li>
            {/* Notifications */}
            <li className="nav-item _header_nav_item">
              <span
                id="_notify_btn"
                className="nav-link _header_nav_link _header_notify_btn"
                onClick={() => setNotifyOpen(!notifyOpen)}
                style={{ cursor: 'pointer' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" fill="none" viewBox="0 0 20 22">
                  <path fill="#000" fillOpacity=".6" fillRule="evenodd" d="M7.547 19.55c.533.59 1.218.915 1.93.915.714 0 1.403-.324 1.938-.916a.777.777 0 011.09-.056c.318.284.344.77.058 1.084-.832.917-1.927 1.423-3.086 1.423h-.002c-1.155-.001-2.248-.506-3.077-1.424a.762.762 0 01.057-1.083.774.774 0 011.092.057zM9.527 0c4.58 0 7.657 3.543 7.657 6.85 0 1.702.436 2.424.899 3.19.457.754.976 1.612.976 3.233-.36 4.14-4.713 4.478-9.531 4.478-4.818 0-9.172-.337-9.528-4.413-.003-1.686.515-2.544.973-3.299l.161-.27c.398-.679.737-1.417.737-2.918C1.871 3.543 4.948 0 9.528 0zm0 1.535c-3.6 0-6.11 2.802-6.11 5.316 0 2.127-.595 3.11-1.12 3.978-.422.697-.755 1.247-.755 2.444.173 1.93 1.455 2.944 7.986 2.944 6.494 0 7.817-1.06 7.988-3.01-.003-1.13-.336-1.681-.757-2.378-.526-.868-1.12-1.851-1.12-3.978 0-2.514-2.51-5.316-6.111-5.316z" clipRule="evenodd" />
                </svg>
                <span className="_counting">6</span>
                <div id="_notify_drop" className={`_notification_dropdown${notifyOpen ? ' show' : ''}`}>
                  <div className="_notifications_content">
                    <h4 className="_notifications_content_title">Notifications</h4>
                  </div>
                  <div className="_notifications_drop_box">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="_notification_box">
                        <div className="_notification_image">
                          <img src="/assets/images/friend-req.png" alt="" className="_notify_img" />
                        </div>
                        <div className="_notification_txt">
                          <p className="_notification_para">
                            <span className="_notify_txt_link">Steve Jobs</span> posted a link in your timeline.
                          </p>
                          <div className="_nitification_time"><span>42 minutes ago</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </span>
            </li>
            {/* Chat */}
            <li className="nav-item _header_nav_item">
              <Link className="nav-link _header_nav_link" to="#">
                <svg xmlns="http://www.w3.org/2000/svg" width="23" height="22" fill="none" viewBox="0 0 23 22">
                  <path fill="#000" fillOpacity=".6" fillRule="evenodd" d="M11.43 0c2.96 0 5.743 1.143 7.833 3.22 4.32 4.29 4.32 11.271 0 15.562C17.145 20.886 14.293 22 11.405 22c-1.575 0-3.16-.33-4.643-1.012-.437-.174-.847-.338-1.14-.338-.338.002-.793.158-1.232.308-.9.307-2.022.69-2.852-.131-.826-.822-.445-1.932-.138-2.826.152-.44.307-.895.307-1.239 0-.282-.137-.642-.347-1.161C-.57 11.46.322 6.47 3.596 3.22A11.04 11.04 0 0111.43 0zm4.068 8.867c.57 0 1.03.458 1.03 1.024 0 .566-.46 1.023-1.03 1.023a1.023 1.023 0 11-.01-2.047h.01zm-4.131 0c.568 0 1.03.458 1.03 1.024 0 .566-.462 1.023-1.03 1.023a1.03 1.03 0 01-1.035-1.024c0-.566.455-1.023 1.025-1.023h.01zm-4.132 0c.568 0 1.03.458 1.03 1.024 0 .566-.462 1.023-1.03 1.023a1.022 1.022 0 11-.01-2.047h.01z" clipRule="evenodd" />
                </svg>
                <span className="_counting">2</span>
              </Link>
            </li>
          </ul>
          {/* Profile Dropdown */}
          <div className="_header_nav_profile">
            <div className="_header_nav_profile_image">
              <img src="/assets/images/profile.png" alt="Profile" className="_nav_profile_img" />
            </div>
            <div className="_header_nav_dropdown">
              <p className="_header_nav_para">Dylan Field</p>
              <button
                className="_header_nav_dropdown_btn _dropdown_toggle"
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" fill="none" viewBox="0 0 10 6">
                  <path fill="#112032" d="M5 5l.354.354L5 5.707l-.354-.353L5 5zm4.354-3.646l-4 4-.708-.708 4-4 .708.708zm-4.708 4l-4-4 .708-.708 4 4-.708.708z" />
                </svg>
              </button>
            </div>
            <div className={`_nav_profile_dropdown _profile_dropdown${profileOpen ? ' show' : ''}`}>
              <div className="_nav_profile_dropdown_info">
                <div className="_nav_profile_dropdown_image">
                  <img src="/assets/images/profile.png" alt="Profile" className="_nav_drop_img" />
                </div>
                <div className="_nav_profile_dropdown_info_txt">
                  <h4 className="_nav_dropdown_title">Dylan Field</h4>
                  <Link to="#" className="_nav_drop_profile">View Profile</Link>
                </div>
              </div>
              <hr />
              <ul className="_nav_dropdown_list">
                <li className="_nav_dropdown_list_item">
                  <Link to="#" className="_nav_dropdown_link">
                    <div className="_nav_drop_info">
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" fill="none" viewBox="0 0 18 19">
                          <path fill="#377DFF" d="M9.584 0c.671 0 1.315.267 1.783.74.468.473.721 1.112.7 1.709l.009.14a.985.985 0 00.136.395c.145.242.382.418.659.488.276.071.57.03.849-.13l.155-.078c1.165-.538 2.563-.11 3.21.991l.58.99a.695.695 0 01.04.081l.055.107c.519 1.089.15 2.385-.838 3.043l-.244.15a1.046 1.046 0 00-.313.339 1.042 1.042 0 00-.11.805c.074.272.255.504.53.66l.158.1c.478.328.823.812.973 1.367.17.626.08 1.292-.257 1.86l-.625 1.022-.094.144c-.735 1.038-2.16 1.355-3.248.738l-.129-.066a1.123 1.123 0 00-.412-.095 1.087 1.087 0 00-.766.31c-.204.2-.317.471-.316.786l-.008.163C11.956 18.022 10.88 19 9.584 19h-1.17c-1.373 0-2.486-1.093-2.484-2.398l-.008-.14a.994.994 0 00-.14-.401 1.066 1.066 0 00-.652-.493 1.12 1.12 0 00-.852.127l-.169.083a2.526 2.526 0 01-1.698.122 2.47 2.47 0 01-1.488-1.154l-.604-1.024-.08-.152a2.404 2.404 0 01.975-3.132l.1-.061c.292-.199.467-.527.467-.877 0-.381-.207-.733-.569-.94l-.147-.092a2.419 2.419 0 01-.724-3.236l.615-.993a2.503 2.503 0 013.366-.912l.126.066c.13.058.269.089.403.09a1.08 1.08 0 001.086-1.068l.008-.185c.049-.57.301-1.106.713-1.513A2.5 2.5 0 018.414 0h1.17zm-.58 6.395c-1.744 0-3.16 1.39-3.16 3.105s1.416 3.105 3.16 3.105c1.746 0 3.161-1.39 3.161-3.105s-1.415-3.105-3.16-3.105z"/>
                        </svg>
                      </span>
                      Settings
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="6" height="10" fill="none" viewBox="0 0 6 10">
                      <path fill="#112032" d="M5 5l.354.354L5.707 5l-.353-.354L5 5zM1.354 9.354l4-4-.708-.708-4 4 .708.708zm4-4.708l-4-4-.708.708 4 4 .708-.708z" opacity=".5"/>
                    </svg>
                  </Link>
                </li>
                <li className="_nav_dropdown_list_item">
                  <Link to="#" className="_nav_dropdown_link">
                    <div className="_nav_drop_info">
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                          <path stroke="#377DFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 19a9 9 0 100-18 9 9 0 000 18z"/>
                          <path stroke="#377DFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7.38 7.3a2.7 2.7 0 015.248.9c0 1.8-2.7 2.7-2.7 2.7M10 14.5h.009"/>
                        </svg>
                      </span>
                      Help &amp; Support
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="6" height="10" fill="none" viewBox="0 0 6 10">
                      <path fill="#112032" d="M5 5l.354.354L5.707 5l-.353-.354L5 5zM1.354 9.354l4-4-.708-.708-4 4 .708.708zm4-4.708l-4-4-.708.708 4 4 .708-.708z" opacity=".5"/>
                    </svg>
                  </Link>
                </li>
                <li className="_nav_dropdown_list_item">
                  <button
                    type="button"
                    className="_nav_dropdown_link"
                    style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                    onClick={handleLogout}
                  >
                    <div className="_nav_drop_info">
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 19 19">
                          <path stroke="#377DFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.667 18H2.889A1.889 1.889 0 011 16.111V2.89A1.889 1.889 0 012.889 1h3.778M13.277 14.222L18 9.5l-4.723-4.722M18 9.5H6.667"/>
                        </svg>
                      </span>
                      Log Out
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="6" height="10" fill="none" viewBox="0 0 6 10">
                      <path fill="#112032" d="M5 5l.354.354L5.707 5l-.353-.354L5 5zM1.354 9.354l4-4-.708-.708-4 4 .708.708zm4-4.708l-4-4-.708.708 4 4 .708-.708z" opacity=".5"/>
                    </svg>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function LeftSidebar() {
  return (
    <div className="_layout_left_sidebar_wrap">
      <div className="_layout_left_sidebar_inner">
        <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <h4 className="_left_inner_area_explore_title _title5 _mar_b24">Explore</h4>
          <ul className="_left_inner_area_explore_list">
            {[
              { label: 'Learning', badge: 'New' },
              { label: 'Insights' },
              { label: 'Find friends' },
              { label: 'Bookmarks' },
              { label: 'Group' },
              { label: 'Gaming', badge: 'New' },
              { label: 'Settings' },
              { label: 'Save post' },
            ].map(({ label, badge }) => (
              <li key={label} className="_left_inner_area_explore_item">
                <Link to="#" className="_left_inner_area_explore_link">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="_layout_left_sidebar_inner">
        <div className="_left_inner_area_suggest _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_left_inner_area_suggest_content _mar_b24">
            <h4 className="_left_inner_area_suggest_content_title _title5">Suggested People</h4>
            <span className="_left_inner_area_suggest_content_txt">
              <Link className="_left_inner_area_suggest_content_txt_link" to="#">See All</Link>
            </span>
          </div>
          {[
            { name: 'Steve Jobs', role: 'CEO of Apple', img: '/assets/images/people1.png' },
            { name: 'Ryan Roslansky', role: 'CEO of Linkedin', img: '/assets/images/people2.png' },
            { name: 'Dylan Field', role: 'CEO of Figma', img: '/assets/images/people3.png' },
          ].map(({ name, role, img }) => (
            <div key={name} className="_left_inner_area_suggest_info">
              <div className="_left_inner_area_suggest_info_box">
                <div className="_left_inner_area_suggest_info_image">
                  <Link to="#">
                    <img src={img} alt={name} className="_info_img" />
                  </Link>
                </div>
                <div className="_left_inner_area_suggest_info_txt">
                  <Link to="#">
                    <h4 className="_left_inner_area_suggest_info_title">{name}</h4>
                  </Link>
                  <p className="_left_inner_area_suggest_info_para">{role}</p>
                </div>
              </div>
              <div className="_left_inner_area_suggest_info_link">
                <Link to="#" className="_info_link">Connect</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="_layout_left_sidebar_inner">
        <div className="_left_inner_area_event _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_left_inner_event_content">
            <h4 className="_left_inner_event_title _title5">Events</h4>
            <Link to="#" className="_left_inner_event_link">See all</Link>
          </div>
          <div className="_left_inner_event_card_link">
            <div className="_left_inner_event_card">
              <div className="_left_inner_event_card_iamge">
                <img src="/assets/images/feed_event1.png" alt="Event" className="_card_img" />
              </div>
              <div className="_left_inner_event_card_content">
                <div className="_left_inner_card_date">
                  <p className="_left_inner_card_date_para">10</p>
                  <p className="_left_inner_card_date_para1">Jul</p>
                </div>
                <div className="_left_inner_card_txt">
                  <h4 className="_left_inner_event_card_title">No more terrorism no more cry</h4>
                </div>
              </div>
              <hr className="_underline" />
              <div className="_left_inner_event_bottom">
                <p className="_left_iner_event_bottom">17 People Going</p>
                <button type="button" className="_left_iner_event_bottom_link">Going</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReplyItem({ reply, postId, depth }) {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [replies, setReplies] = useState([]);
  const repliesPageRef = useRef(0);
  const repliesLoadingRef = useRef(false);
  const [repliesHasMore, setRepliesHasMore] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesCount, setRepliesCount] = useState(reply.replies_count);
  const [replyFormOpen, setReplyFormOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fontSize = depth === 2 ? '13px' : '12px';
  const metaSize = depth === 2 ? '12px' : '11px';

  const loadReplies = async (page) => {
    if (repliesLoadingRef.current) return;
    repliesLoadingRef.current = true;
    setRepliesLoading(true);
    try {
      const res = await getCommentReplies(postId, reply.id, page);
      const { data: newReplies, last_page } = res.data.data;
      setReplies(prev => page === 1 ? newReplies : [...prev, ...newReplies]);
      setRepliesHasMore(page < last_page);
      repliesPageRef.current = page;
    } catch (_) {
    } finally {
      repliesLoadingRef.current = false;
      setRepliesLoading(false);
    }
  };

  const handleRepliesClick = () => {
    if (!repliesOpen && repliesPageRef.current === 0) {
      loadReplies(1);
    }
    setRepliesOpen(prev => !prev);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await createReply(postId, reply.id, replyText.trim());
      const newReply = { ...res.data.data, likes_count: 0, dislikes_count: 0, replies_count: 0 };
      setReplies(prev => [newReply, ...prev]);
      setRepliesCount(prev => prev + 1);
      setRepliesOpen(true);
      setReplyText('');
      setReplyFormOpen(false);
    } catch (_) {
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div style={{ borderTop: '1px solid #f5f5f5', padding: '8px 0' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <img src="/assets/images/comment_img.png" alt="" className="_comment_img" />
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, fontSize: fontSize, margin: 0 }}>{reply.user.first_name} {reply.user.last_name}</p>
          <p style={{ fontSize: fontSize, color: '#555', margin: '2px 0 4px' }}>{reply.content}</p>
          <div style={{ display: 'flex', gap: '12px', fontSize: metaSize, color: '#aaa', flexWrap: 'wrap' }}>
            <span>👍 {reply.likes_count}</span>
            <span>👎 {reply.dislikes_count}</span>
            {repliesCount > 0 ? (
              <button
                type="button"
                onClick={handleRepliesClick}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: metaSize, color: '#377DFF' }}
              >
                💬 {repliesCount} {repliesOpen ? 'Hide replies' : 'Replies'}
              </button>
            ) : (
              <span>💬 0 Replies</span>
            )}
            <span>{timeAgo(reply.created_at)}</span>
            {depth < 3 && (
              <button
                type="button"
                onClick={() => setReplyFormOpen(prev => !prev)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: metaSize, color: '#377DFF' }}
              >
                {replyFormOpen ? 'Cancel' : 'Reply'}
              </button>
            )}
          </div>
          {depth < 3 && replyFormOpen && (
            <form onSubmit={handleReplySubmit} style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <textarea
                className="form-control _comment_textarea"
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReplySubmit(e); } }}
                disabled={submittingReply}
                style={{ fontSize: '12px', minHeight: '34px', resize: 'none' }}
              />
              <button
                type="submit"
                disabled={submittingReply || !replyText.trim()}
                style={{ background: '#377DFF', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {submittingReply ? '...' : 'Send'}
              </button>
            </form>
          )}
          {repliesOpen && (
            <div style={{ marginTop: '6px', marginLeft: '24px' }}>
              {repliesLoading && replies.length === 0 && (
                <div style={{ padding: '4px 0' }}>
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
              {replies.map(subReply => (
                <ReplyItem key={subReply.id} reply={subReply} postId={postId} depth={depth + 1} />
              ))}
              {!repliesLoading && replies.length === 0 && (
                <p style={{ color: '#aaa', fontSize: '11px', margin: 0 }}>No replies yet.</p>
              )}
              {repliesHasMore && (
                <div style={{ padding: '4px 0' }}>
                  <button
                    type="button"
                    onClick={() => loadReplies(repliesPageRef.current + 1)}
                    disabled={repliesLoading}
                    style={{ background: 'none', border: '1px solid #ddd', borderRadius: '6px', padding: '3px 10px', fontSize: '11px', cursor: 'pointer', color: '#377DFF' }}
                  >
                    {repliesLoading ? 'Loading...' : 'Load more replies'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment, postId }) {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [replies, setReplies] = useState([]);
  const repliesPageRef = useRef(0);
  const repliesLoadingRef = useRef(false);
  const [repliesHasMore, setRepliesHasMore] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesCount, setRepliesCount] = useState(comment.replies_count);
  const [replyFormOpen, setReplyFormOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const loadReplies = async (page) => {
    if (repliesLoadingRef.current) return;
    repliesLoadingRef.current = true;
    setRepliesLoading(true);
    try {
      const res = await getCommentReplies(postId, comment.id, page);
      const { data: newReplies, last_page } = res.data.data;
      setReplies(prev => page === 1 ? newReplies : [...prev, ...newReplies]);
      setRepliesHasMore(page < last_page);
      repliesPageRef.current = page;
    } catch (_) {
    } finally {
      repliesLoadingRef.current = false;
      setRepliesLoading(false);
    }
  };

  const handleRepliesClick = () => {
    if (!repliesOpen && repliesPageRef.current === 0) {
      loadReplies(1);
    }
    setRepliesOpen(prev => !prev);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await createReply(postId, comment.id, replyText.trim());
      const newReply = { ...res.data.data, likes_count: 0, dislikes_count: 0, replies_count: 0 };
      setReplies(prev => [newReply, ...prev]);
      setRepliesCount(prev => prev + 1);
      setRepliesOpen(true);
      setReplyText('');
      setReplyFormOpen(false);
    } catch (_) {
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div style={{ borderTop: '1px solid #f0f0f0', padding: '10px 0' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <img src="/assets/images/comment_img.png" alt="" className="_comment_img" />
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>{comment.user.first_name} {comment.user.last_name}</p>
          <p style={{ fontSize: '13px', color: '#555', margin: '2px 0 6px' }}>{comment.content}</p>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#888', flexWrap: 'wrap' }}>
            <span>👍 {comment.likes_count}</span>
            <span>👎 {comment.dislikes_count}</span>
            {repliesCount > 0 ? (
              <button
                type="button"
                onClick={handleRepliesClick}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '12px', color: '#377DFF' }}
              >
                💬 {repliesCount} {repliesOpen ? 'Hide replies' : 'Replies'}
              </button>
            ) : (
              <span>💬 0 Replies</span>
            )}
            <span>{timeAgo(comment.created_at)}</span>
            <button
              type="button"
              onClick={() => setReplyFormOpen(prev => !prev)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '12px', color: '#377DFF' }}
            >
              {replyFormOpen ? 'Cancel' : 'Reply'}
            </button>
          </div>
          {replyFormOpen && (
            <form onSubmit={handleReplySubmit} style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <textarea
                className="form-control _comment_textarea"
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReplySubmit(e); } }}
                disabled={submittingReply}
                style={{ fontSize: '13px', minHeight: '36px', resize: 'none' }}
              />
              <button
                type="submit"
                disabled={submittingReply || !replyText.trim()}
                style={{ background: '#377DFF', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '13px', color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {submittingReply ? '...' : 'Send'}
              </button>
            </form>
          )}
          {repliesOpen && (
            <div style={{ marginTop: '8px', marginLeft: '32px' }}>
              {repliesLoading && replies.length === 0 && (
                <div style={{ padding: '6px 0' }}>
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
              {replies.map(reply => (
                <ReplyItem key={reply.id} reply={reply} postId={postId} depth={2} />
              ))}
              {!repliesLoading && replies.length === 0 && (
                <p style={{ color: '#aaa', fontSize: '12px', margin: 0 }}>No replies yet.</p>
              )}
              {repliesHasMore && (
                <div style={{ padding: '6px 0' }}>
                  <button
                    type="button"
                    onClick={() => loadReplies(repliesPageRef.current + 1)}
                    disabled={repliesLoading}
                    style={{ background: 'none', border: '1px solid #ddd', borderRadius: '6px', padding: '4px 12px', fontSize: '12px', cursor: 'pointer', color: '#377DFF' }}
                  >
                    {repliesLoading ? 'Loading...' : 'Load more replies'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const commentsPageRef = useRef(0);
  const commentsLoadingRef = useRef(false);
  const [commentsHasMore, setCommentsHasMore] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments_count);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [dislikesCount, setDislikesCount] = useState(post.dislikes_count);
  const [liking, setLiking] = useState(false);

  const handleLike = async (type) => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await likePost(post.id, type);
      setLikesCount(res.data.data.likes_count);
      setDislikesCount(res.data.data.dislikes_count);
    } catch (_) {
    } finally {
      setLiking(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await createComment(post.id, commentText.trim());
      const newComment = { ...res.data.data, likes_count: 0, dislikes_count: 0, replies_count: 0 };
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      setCommentCount(prev => prev + 1);
      setCommentsOpen(true);
    } catch (_) {
    } finally {
      setSubmittingComment(false);
    }
  };

  const loadComments = async (page) => {
    if (commentsLoadingRef.current) return;
    commentsLoadingRef.current = true;
    setCommentsLoading(true);
    try {
      const res = await getPostComments(post.id, page);
      const { data: newComments, last_page } = res.data.data;
      setComments(prev => page === 1 ? newComments : [...prev, ...newComments]);
      setCommentsHasMore(page < last_page);
      commentsPageRef.current = page;
    } catch (_) {
    } finally {
      commentsLoadingRef.current = false;
      setCommentsLoading(false);
    }
  };

  const handleCommentCountClick = () => {
    if (!commentsOpen && commentsPageRef.current === 0) {
      loadComments(1);
    }
    setCommentsOpen(prev => !prev);
  };

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <img src="/assets/images/post_img.png" alt="" className="_post_img" />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">{post.user.first_name} {post.user.last_name}</h4>
              <p className="_feed_inner_timeline_post_box_para">
                {timeAgo(post.created_at)} . <Link to="#">{post.visibility === 'public' ? 'Public' : 'Private'}</Link>
              </p>
            </div>
          </div>
          <div className="_feed_inner_timeline_post_box_dropdown">
            <div className="_feed_timeline_post_dropdown">
              <button className="_feed_timeline_post_dropdown_link" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                  <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <p className="_feed_inner_timeline_post_title">{post.content}</p>
        {post.image_path && (
          <div className="_feed_inner_timeline_image">
            <img src={`${STORAGE_BASE}/${post.image_path}`} alt="Post" className="_time_img" />
          </div>
        )}
      </div>
      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div className="_feed_inner_timeline_total_reacts_txt">
          <button
            type="button"
            onClick={() => handleLike('like')}
            disabled={liking}
            className="_feed_inner_timeline_total_reacts_para1"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 'inherit' }}
          >
            👍 <span>{likesCount}</span> Like
          </button>
          <button
            type="button"
            onClick={() => handleLike('dislike')}
            disabled={liking}
            className="_feed_inner_timeline_total_reacts_para2"
            style={{ marginLeft: '20px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 'inherit' }}
          >
            👎 <span>{dislikesCount}</span> Dislike
          </button>
          <button
            type="button"
            onClick={handleCommentCountClick}
            style={{ marginLeft: '20px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 'inherit', color: '#377DFF' }}
          >
            💬 <span>{commentCount}</span> Comment
          </button>
        </div>
      </div>
      <div className="_feed_inner_timeline_cooment_area">
        <div className="_feed_inner_comment_box">
          <form className="_feed_inner_comment_box_form" onSubmit={handleCommentSubmit}>
            <div className="_feed_inner_comment_box_content">
              <div className="_feed_inner_comment_box_content_image">
                <img src="/assets/images/comment_img.png" alt="" className="_comment_img" />
              </div>
              <div className="_feed_inner_comment_box_content_txt">
                <textarea
                  className="form-control _comment_textarea"
                  placeholder="Write a comment"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCommentSubmit(e); } }}
                  disabled={submittingComment}
                />
              </div>
            </div>
          </form>
        </div>
        {commentsOpen && (
          <div style={{ marginTop: '8px' }}>
            {commentsLoading && comments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
            {comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} postId={post.id} />
            ))}
            {!commentsLoading && comments.length === 0 && (
              <p style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', padding: '8px 0' }}>No comments yet.</p>
            )}
            {commentsHasMore && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <button
                  type="button"
                  onClick={() => loadComments(commentsPageRef.current + 1)}
                  disabled={commentsLoading}
                  style={{ background: 'none', border: '1px solid #ddd', borderRadius: '6px', padding: '5px 16px', fontSize: '13px', cursor: 'pointer', color: '#377DFF' }}
                >
                  {commentsLoading ? 'Loading...' : 'Load more comments'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MiddleContent() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const sentinelRef = useRef(null);
  const fileInputRef = useRef(null);

  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [posting, setPosting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handlePost = async () => {
    if (!content.trim()) {
      toast.error('Content is required.');
      return;
    }
    setPosting(true);
    try {
      const fd = new FormData();
      fd.append('content', content.trim());
      fd.append('visibility', visibility);
      if (image) fd.append('image', image);
      const res = await createPost(fd);
      const newPost = res.data.data;
      setPosts(prev => [newPost, ...prev]);
      setContent('');
      setVisibility('public');
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Post created successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create post.');
    } finally {
      setPosting(false);
    }
  };

  const loadPosts = async (pageNum) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await getFeed(pageNum);
      const { data: newPosts, last_page } = res.data.data;
      setPosts(prev => pageNum === 1 ? newPosts : [...prev, ...newPosts]);
      setHasMore(pageNum < last_page);
    } catch (_) {
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(1);
  }, []);

  useEffect(() => {
    if (page === 1) return;
    loadPosts(page);
  }, [page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <div className="_layout_middle_wrap">
      <div className="_layout_middle_inner">
        {/* Stories */}
        <div className="_feed_inner_ppl_card _mar_b16">
          <div className="row">
            {[
              { img: '/assets/images/card_ppl1.png', label: 'Your Story', isOwn: true },
              { img: '/assets/images/card_ppl2.png', label: 'Ryan Roslansky' },
              { img: '/assets/images/card_ppl3.png', label: 'Steve Jobs' },
              { img: '/assets/images/card_ppl4.png', label: 'Dylan Field' },
            ].map(({ img, label, isOwn }) => (
              <div key={label} className="col-xl-3 col-lg-3 col-md-4 col-sm-4 col">
                <div className={isOwn ? '_feed_inner_profile_story _b_radious6' : '_feed_inner_public_story _b_radious6'}>
                  <div className={isOwn ? '_feed_inner_profile_story_image' : '_feed_inner_public_story_image'}>
                    <img src={img} alt={label} className={isOwn ? '_profile_story_img' : '_public_story_img'} />
                    {isOwn ? (
                      <div className="_feed_inner_story_txt">
                        <div className="_feed_inner_story_btn">
                          <button className="_feed_inner_story_btn_link" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
                              <path stroke="#fff" strokeLinecap="round" d="M.5 4.884h9M4.884 9.5v-9" />
                            </svg>
                          </button>
                        </div>
                        <p className="_feed_inner_story_para">Your Story</p>
                      </div>
                    ) : (
                      <>
                        <div className="_feed_inner_pulic_story_txt">
                          <p className="_feed_inner_pulic_story_para">{label}</p>
                        </div>
                        <div className="_feed_inner_public_mini">
                          <img src="/assets/images/mini_pic.png" alt="" className="_public_mini_img" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Post composer */}
        <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
          <div className="_feed_inner_text_area_box">
            <div className="_feed_inner_text_area_box_image">
              <img src="/assets/images/txt_img.png" alt="" className="_txt_img" />
            </div>
            <div className="_feed_inner_text_area_box_form">
              <textarea
                className="form-control _textarea"
                placeholder="Write something ..."
                id="postTextarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
          {imagePreview && (
            <div style={{ marginTop: '10px', position: 'relative', display: 'inline-block' }}>
              <img src={imagePreview} alt="Preview" style={{ maxHeight: '180px', borderRadius: '8px', maxWidth: '100%' }} />
              <button
                type="button"
                onClick={() => { setImage(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', lineHeight: '22px', textAlign: 'center', fontSize: '14px' }}
              >×</button>
            </div>
          )}
          <div className="_feed_inner_text_area_bottom">
            <div className="_feed_inner_text_area_item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="_feed_inner_text_area_bottom_photo _feed_common">
                <button type="button" className="_feed_inner_text_area_bottom_photo_link" onClick={() => fileInputRef.current?.click()}>Photo</button>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              </div>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                style={{ border: '1px solid #e0e0e0', borderRadius: '6px', padding: '4px 8px', fontSize: '13px', color: '#555', cursor: 'pointer' }}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className="_feed_inner_text_area_btn">
              <button type="button" className="_feed_inner_text_area_btn_link" onClick={handlePost} disabled={posting}>
                <svg className="_mar_img" xmlns="http://www.w3.org/2000/svg" width="14" height="13" fill="none" viewBox="0 0 14 13">
                  <path fill="#fff" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z" clipRule="evenodd" />
                </svg>
                <span>{posting ? 'Posting...' : 'Post'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feed posts */}
        {posts.map((post) => <PostCard key={post.id} post={post} />)}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} style={{ height: 1 }} />
        {loading && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p style={{ textAlign: 'center', color: '#999', padding: '16px 0', fontSize: '14px' }}>No more posts</p>
        )}
      </div>
    </div>
  );
}

function RightSidebar() {
  const friends = [
    { name: 'Steve Jobs', role: 'CEO of Apple', img: '/assets/images/people1.png', online: false, time: '5 minute ago' },
    { name: 'Ryan Roslansky', role: 'CEO of Linkedin', img: '/assets/images/people2.png', online: true },
    { name: 'Dylan Field', role: 'CEO of Figma', img: '/assets/images/people3.png', online: true },
  ];

  return (
    <div className="_layout_right_sidebar_wrap">
      <div className="_layout_right_sidebar_inner">
        <div className="_right_inner_area_info _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_right_inner_area_info_content _mar_b24">
            <h4 className="_right_inner_area_info_content_title _title5">You Might Like</h4>
            <span className="_right_inner_area_info_content_txt">
              <Link className="_right_inner_area_info_content_txt_link" to="#">See All</Link>
            </span>
          </div>
          <hr className="_underline" />
          <div className="_right_inner_area_info_ppl">
            <div className="_right_inner_area_info_box">
              <div className="_right_inner_area_info_box_image">
                <Link to="#">
                  <img src="/assets/images/Avatar.png" alt="Avatar" className="_ppl_img" />
                </Link>
              </div>
              <div className="_right_inner_area_info_box_txt">
                <Link to="#">
                  <h4 className="_right_inner_area_info_box_title">Radovan SkillArena</h4>
                </Link>
                <p className="_right_inner_area_info_box_para">Founder &amp; CEO at Trophy</p>
              </div>
            </div>
            <div className="_right_info_btn_grp">
              <button type="button" className="_right_info_btn_link">Ignore</button>
              <button type="button" className="_right_info_btn_link _right_info_btn_link_active">Follow</button>
            </div>
          </div>
        </div>
      </div>

      <div className="_layout_right_sidebar_inner">
        <div className="_feed_right_inner_area_card _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_feed_top_fixed">
            <div className="_feed_right_inner_area_card_content _mar_b24">
              <h4 className="_feed_right_inner_area_card_content_title _title5">Your Friends</h4>
              <span className="_feed_right_inner_area_card_content_txt">
                <Link className="_feed_right_inner_area_card_content_txt_link" to="#">See All</Link>
              </span>
            </div>
            <form className="_feed_right_inner_area_card_form">
              <svg className="_feed_right_inner_area_card_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                <circle cx="7" cy="7" r="6" stroke="#666" />
                <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
              </svg>
              <input className="form-control me-2 _feed_right_inner_area_card_form_inpt" type="search" placeholder="Search friends" aria-label="Search" />
            </form>
          </div>
          <div className="_feed_bottom_fixed">
            {friends.map(({ name, role, img, online, time }) => (
              <div key={name} className={`_feed_right_inner_area_card_ppl${!online ? ' _feed_right_inner_area_card_ppl_inactive' : ''}`}>
                <div className="_feed_right_inner_area_card_ppl_box">
                  <div className="_feed_right_inner_area_card_ppl_image">
                    <Link to="#">
                      <img src={img} alt={name} className="_box_ppl_img" />
                    </Link>
                  </div>
                  <div className="_feed_right_inner_area_card_ppl_txt">
                    <Link to="#">
                      <h4 className="_feed_right_inner_area_card_ppl_title">{name}</h4>
                    </Link>
                    <p className="_feed_right_inner_area_card_ppl_para">{role}</p>
                  </div>
                </div>
                <div className="_feed_right_inner_area_card_ppl_side">
                  {online ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14">
                      <rect width="12" height="12" x="1" y="1" fill="#0ACF83" stroke="#fff" strokeWidth="2" rx="6" />
                    </svg>
                  ) : (
                    <span>{time}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Feed() {
  return (
    <div className="_layout _layout_main_wrapper">
      <div className="_main_layout">
        <Navbar />
        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <LeftSidebar />
              </div>
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <MiddleContent />
              </div>
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <RightSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
