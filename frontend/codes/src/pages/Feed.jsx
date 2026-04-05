import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logoutUser, getFeed, createPost, updatePost, deletePost, getPostComments, createComment, getCommentReplies, createReply, likePost, likeComment, getPostLikers, getCommentLikers } from '../api/authService';
import Modal from '../components/Modal';
import Navbar from '../components/Navbar';
import Avatar from '../components/Avatar';

const STORAGE_BASE = import.meta.env.VITE_STORAGE_BASE;

function getApiError(err, fallback) {
  const data = err?.response?.data;
  if (data?.errors) {
    const first = Object.values(data.errors).flat()[0];
    if (first) return first;
  }
  return data?.message || fallback;
}

function timeAgo(dateString) {
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
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
  const [likesCount, setLikesCount] = useState(reply.likes_count);
  const [dislikesCount, setDislikesCount] = useState(reply.dislikes_count);
  const [liking, setLiking] = useState(false);
  const [likersModal, setLikersModal] = useState({ open: false, type: null });
  const [likersList, setLikersList] = useState([]);
  const [likersPage, setLikersPage] = useState(0);
  const [likersHasMore, setLikersHasMore] = useState(false);
  const [likersLoading, setLikersLoading] = useState(false);

  const handleLike = async (type) => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await likeComment(postId, reply.id, type);
      setLikesCount(res.data.data.likes_count);
      setDislikesCount(res.data.data.dislikes_count);
    } catch (_) {
    } finally {
      setLiking(false);
    }
  };

  const loadLikers = async (type, page) => {
    setLikersLoading(true);
    try {
      const res = await getCommentLikers(postId, reply.id, type, page);
      const { data: newUsers, last_page } = res.data.data;
      setLikersList(prev => page === 1 ? newUsers : [...prev, ...newUsers]);
      setLikersHasMore(page < last_page);
      setLikersPage(page);
    } catch (_) {
    } finally {
      setLikersLoading(false);
    }
  };

  const openLikersModal = (type) => {
    setLikersModal({ open: true, type });
    setLikersList([]);
    setLikersPage(0);
    setLikersHasMore(false);
    loadLikers(type, 1);
  };
  const metaSize = depth === 2 ? '12px' : '11px';
  const fontSize = depth === 2 ? '13px' : '12px';

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
    <>
    <div style={{ borderTop: '1px solid #f5f5f5', padding: '8px 0' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <Avatar firstName={reply.user.first_name} lastName={reply.user.last_name} size={24} className="_comment_img" />
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, fontSize: fontSize, margin: 0 }}>{reply.user.first_name} {reply.user.last_name}</p>
          <p style={{ fontSize: fontSize, color: '#555', margin: '2px 0 4px' }}>{reply.content}</p>
          <div style={{ display: 'flex', gap: '12px', fontSize: metaSize, color: '#aaa', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <button type="button" onClick={() => handleLike('like')} disabled={liking}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: metaSize, color: '#aaa' }}>👍</button>
              <button type="button" onClick={() => openLikersModal('like')}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: metaSize, color: '#aaa' }}>{likesCount} Like</button>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <button type="button" onClick={() => handleLike('dislike')} disabled={liking}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: metaSize, color: '#aaa' }}>👎</button>
              <button type="button" onClick={() => openLikersModal('dislike')}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: metaSize, color: '#aaa' }}>{dislikesCount} Dislike</button>
            </span>
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
      <Modal
        isOpen={likersModal.open}
        onClose={() => setLikersModal({ open: false, type: null })}
        title={likersModal.type === 'like' ? '👍 Liked by' : '👎 Disliked by'}
      >
        {likersLoading && likersList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="spinner-border spinner-border-sm text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
          </div>
        ) : likersList.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#aaa', fontSize: '14px', margin: '20px 0' }}>No one yet.</p>
        ) : (
          <>
            {likersList.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                <Avatar firstName={item.user.first_name} lastName={item.user.last_name} size={30} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.user.first_name} {item.user.last_name}</span>
              </div>
            ))}
            {likersHasMore && (
              <div style={{ textAlign: 'center', paddingTop: '12px' }}>
                <button type="button" onClick={() => loadLikers(likersModal.type, likersPage + 1)} disabled={likersLoading}
                  style={{ background: 'none', border: '1px solid #ddd', borderRadius: '6px', padding: '6px 18px', fontSize: '13px', cursor: 'pointer', color: '#377DFF' }}>
                  {likersLoading ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </Modal>
    </>
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
  const [likesCount, setLikesCount] = useState(comment.likes_count);
  const [dislikesCount, setDislikesCount] = useState(comment.dislikes_count);
  const [liking, setLiking] = useState(false);
  const [likersModal, setLikersModal] = useState({ open: false, type: null });
  const [likersList, setLikersList] = useState([]);
  const [likersPage, setLikersPage] = useState(0);
  const [likersHasMore, setLikersHasMore] = useState(false);
  const [likersLoading, setLikersLoading] = useState(false);

  const handleLike = async (type) => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await likeComment(postId, comment.id, type);
      setLikesCount(res.data.data.likes_count);
      setDislikesCount(res.data.data.dislikes_count);
    } catch (_) {
    } finally {
      setLiking(false);
    }
  };

  const loadLikers = async (type, page) => {
    setLikersLoading(true);
    try {
      const res = await getCommentLikers(postId, comment.id, type, page);
      const { data: newUsers, last_page } = res.data.data;
      setLikersList(prev => page === 1 ? newUsers : [...prev, ...newUsers]);
      setLikersHasMore(page < last_page);
      setLikersPage(page);
    } catch (_) {
    } finally {
      setLikersLoading(false);
    }
  };

  const openLikersModal = (type) => {
    setLikersModal({ open: true, type });
    setLikersList([]);
    setLikersPage(0);
    setLikersHasMore(false);
    loadLikers(type, 1);
  };

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
    <>
    <div style={{ borderTop: '1px solid #f0f0f0', padding: '10px 0' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <Avatar firstName={comment.user.first_name} lastName={comment.user.last_name} size={24} className="_comment_img" />
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>{comment.user.first_name} {comment.user.last_name}</p>
          <p style={{ fontSize: '13px', color: '#555', margin: '2px 0 6px' }}>{comment.content}</p>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#888', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <button type="button" onClick={() => handleLike('like')} disabled={liking}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '12px', color: '#888' }}>👍</button>
              <button type="button" onClick={() => openLikersModal('like')}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '12px', color: '#888' }}>{likesCount} Like</button>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <button type="button" onClick={() => handleLike('dislike')} disabled={liking}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '12px', color: '#888' }}>👎</button>
              <button type="button" onClick={() => openLikersModal('dislike')}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '12px', color: '#888' }}>{dislikesCount} Dislike</button>
            </span>
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
      <Modal
        isOpen={likersModal.open}
        onClose={() => setLikersModal({ open: false, type: null })}
        title={likersModal.type === 'like' ? '👍 Liked by' : '👎 Disliked by'}
      >
        {likersLoading && likersList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="spinner-border spinner-border-sm text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
          </div>
        ) : likersList.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#aaa', fontSize: '14px', margin: '20px 0' }}>No one yet.</p>
        ) : (
          <>
            {likersList.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                <Avatar firstName={item.user.first_name} lastName={item.user.last_name} size={36} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.user.first_name} {item.user.last_name}</span>
              </div>
            ))}
            {likersHasMore && (
              <div style={{ textAlign: 'center', paddingTop: '12px' }}>
                <button type="button" onClick={() => loadLikers(likersModal.type, likersPage + 1)} disabled={likersLoading}
                  style={{ background: 'none', border: '1px solid #ddd', borderRadius: '6px', padding: '6px 18px', fontSize: '13px', cursor: 'pointer', color: '#377DFF' }}>
                  {likersLoading ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
}

function PostCard({ post, onDelete }) {
  const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwn = loggedUser.id && post.user_id === loggedUser.id;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editVisibility, setEditVisibility] = useState(post.visibility);
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [updating, setUpdating] = useState(false);
  const editFileInputRef = useRef(null);
  const [postContent, setPostContent] = useState(post.content);
  const [postVisibility, setPostVisibility] = useState(post.visibility);
  const [postImagePath, setPostImagePath] = useState(post.image_path);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const commentsPageRef = useRef(0);
  const commentsLoadingRef = useRef(false);
  const [commentsHasMore, setCommentsHasMore] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments_count ?? 0);
  const [likesCount, setLikesCount] = useState(post.likes_count ?? 0);
  const [dislikesCount, setDislikesCount] = useState(post.dislikes_count ?? 0);
  const [liking, setLiking] = useState(false);
  const [likersModal, setLikersModal] = useState({ open: false, type: null });
  const [likersList, setLikersList] = useState([]);
  const [likersPage, setLikersPage] = useState(0);
  const [likersHasMore, setLikersHasMore] = useState(false);
  const [likersLoading, setLikersLoading] = useState(false);

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

  const loadLikers = async (type, page) => {
    setLikersLoading(true);
    try {
      const res = await getPostLikers(post.id, type, page);
      const { data: newUsers, last_page } = res.data.data;
      setLikersList(prev => page === 1 ? newUsers : [...prev, ...newUsers]);
      setLikersHasMore(page < last_page);
      setLikersPage(page);
    } catch (_) {
    } finally {
      setLikersLoading(false);
    }
  };

  const openLikersModal = (type) => {
    setLikersModal({ open: true, type });
    setLikersList([]);
    setLikersPage(0);
    setLikersHasMore(false);
    loadLikers(type, 1);
  };

  const closeLikersModal = () => setLikersModal({ open: false, type: null });

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    setUpdating(true);
    try {
      const fd = new FormData();
      fd.append('content', editContent.trim());
      fd.append('visibility', editVisibility);
      if (editImage) fd.append('image', editImage);
      const res = await updatePost(post.id, fd);
      const updated = res.data.data;
      setPostContent(updated.content);
      setPostVisibility(updated.visibility);
      setPostImagePath(updated.image_path);
      setEditOpen(false);
      setEditImage(null);
      setEditImagePreview(null);
      toast.success('Post updated successfully!');
    } catch (err) {
      toast.error(getApiError(err, 'Failed to update post.'));
    } finally {
      setUpdating(false);
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
              <Avatar firstName={post.user.first_name} lastName={post.user.last_name} size={44} className="_post_img" />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">{post.user.first_name} {post.user.last_name}</h4>
              <p className="_feed_inner_timeline_post_box_para">
                {timeAgo(post.created_at)} . <Link to="#">{postVisibility === 'public' ? 'Public' : 'Private'}</Link>
              </p>
            </div>
          </div>
          <div className="_feed_inner_timeline_post_box_dropdown">
            <div className="_feed_timeline_post_dropdown" style={{ position: 'relative' }}>
              <button className="_feed_timeline_post_dropdown_link" type="button" onClick={() => setDropdownOpen(p => !p)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                  <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                </svg>
              </button>
              {dropdownOpen && isOwn && (
                <div style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '120px' }}>
                  <button
                    type="button"
                    onClick={() => { setEditOpen(true); setDropdownOpen(false); setEditContent(postContent); setEditVisibility(postVisibility); }}
                    style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '10px 16px', textAlign: 'left', fontSize: '13px', cursor: 'pointer', color: '#333' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={async () => {
                      if (!window.confirm('Are you sure you want to delete this post?')) return;
                      setDeleting(true);
                      setDropdownOpen(false);
                      try {
                        await deletePost(post.id);
                        toast.success('Post deleted successfully!');
                        onDelete?.(post.id);
                      } catch (err) {
                        toast.error(getApiError(err, 'Failed to delete post.'));
                      } finally {
                        setDeleting(false);
                      }
                    }}
                    style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '10px 16px', textAlign: 'left', fontSize: '13px', cursor: 'pointer', color: '#e74c3c' }}
                  >
                    {deleting ? '⏳ Deleting...' : '🗑️ Delete'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {editOpen ? (
          <form onSubmit={handleEditSubmit} style={{ margin: '12px 0' }}>
            <textarea
              className="form-control _textarea"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={{ minHeight: '80px', marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <select
                value={editVisibility}
                onChange={(e) => setEditVisibility(e.target.value)}
                style={{ border: '1px solid #e0e0e0', borderRadius: '6px', padding: '4px 8px', fontSize: '13px', color: '#555', cursor: 'pointer' }}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <button type="button" onClick={() => editFileInputRef.current?.click()}
                style={{ background: 'none', border: '1px solid #ddd', borderRadius: '6px', padding: '4px 10px', fontSize: '13px', cursor: 'pointer', color: '#555' }}>
                📷 Change Image
              </button>
              <input ref={editFileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => { const f = e.target.files[0]; if (!f) return; setEditImage(f); setEditImagePreview(URL.createObjectURL(f)); }} />
            </div>
            {editImagePreview ? (
              <div style={{ marginBottom: '8px', position: 'relative', display: 'inline-block' }}>
                <img src={editImagePreview} alt="Preview" style={{ maxHeight: '160px', borderRadius: '8px', maxWidth: '100%' }} />
                <button type="button" onClick={() => { setEditImage(null); setEditImagePreview(null); if (editFileInputRef.current) editFileInputRef.current.value = ''; }}
                  style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '14px', lineHeight: '22px', textAlign: 'center' }}>×</button>
              </div>
            ) : postImagePath ? (
              <div style={{ marginBottom: '8px', position: 'relative', display: 'inline-block' }}>
                <img src={`${STORAGE_BASE}/${postImagePath}`} alt="Current" style={{ maxHeight: '160px', borderRadius: '8px', maxWidth: '100%', opacity: 0.7 }} />
                <p style={{ fontSize: '11px', color: '#999', margin: '2px 0 0' }}>Current image (upload new to replace)</p>
              </div>
            ) : null}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={updating || !editContent.trim()}
                style={{ background: '#377DFF', border: 'none', borderRadius: '6px', padding: '6px 18px', fontSize: '13px', color: '#fff', cursor: 'pointer' }}>
                {updating ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => { setEditOpen(false); setEditImage(null); setEditImagePreview(null); }}
                style={{ background: 'none', border: '1px solid #ddd', borderRadius: '6px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer', color: '#555' }}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="_feed_inner_timeline_post_title">{postContent}</p>
            {postImagePath && (
              <div className="_feed_inner_timeline_image">
                <img src={`${STORAGE_BASE}/${postImagePath}`} alt="Post" className="_time_img" />
              </div>
            )}
          </>
        )}
      </div>
      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div className="_feed_inner_timeline_total_reacts_txt">
          <span className="_feed_inner_timeline_total_reacts_para1" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <button type="button" onClick={() => handleLike('like')} disabled={liking}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 'inherit' }}>
              👍
            </button>
            <button type="button" onClick={() => openLikersModal('like')}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 'inherit', color: 'inherit' }}>
              <span>{likesCount}</span> Like
            </button>
          </span>
          <span className="_feed_inner_timeline_total_reacts_para2" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '20px' }}>
            <button type="button" onClick={() => handleLike('dislike')} disabled={liking}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 'inherit' }}>
              👎
            </button>
            <button type="button" onClick={() => openLikersModal('dislike')}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 'inherit', color: 'inherit' }}>
              <span>{dislikesCount}</span> Dislike
            </button>
          </span>
          <button
            type="button"
            onClick={handleCommentCountClick}
            style={{ marginLeft: '20px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 'inherit', color: '#377DFF' }}
          >
            💬 <span>{commentCount}</span> Comment
          </button>
        </div>
      </div>
      <Modal
        isOpen={likersModal.open}
        onClose={closeLikersModal}
        title={likersModal.type === 'like' ? '👍 People who liked this' : '👎 People who disliked this'}
      >
        {likersLoading && likersList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : likersList.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#aaa', fontSize: '14px', margin: '20px 0' }}>No one yet.</p>
        ) : (
          <>
            {likersList.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                <Avatar firstName={item.user.first_name} lastName={item.user.last_name} size={30} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.user.first_name} {item.user.last_name}</span>
              </div>
            ))}
            {likersHasMore && (
              <div style={{ textAlign: 'center', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => loadLikers(likersModal.type, likersPage + 1)}
                  disabled={likersLoading}
                  style={{ background: 'none', border: '1px solid #ddd', borderRadius: '6px', padding: '6px 18px', fontSize: '13px', cursor: 'pointer', color: '#377DFF' }}
                >
                  {likersLoading ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </Modal>
      <div className="_feed_inner_timeline_cooment_area">
        <div className="_feed_inner_comment_box">
          <form className="_feed_inner_comment_box_form" onSubmit={handleCommentSubmit}>
            <div className="_feed_inner_comment_box_content">
              <div className="_feed_inner_comment_box_content_image">
                <Avatar firstName={loggedUser.first_name || ''} lastName={loggedUser.last_name || ''} size={24} className="_comment_img" />
              </div>
              <div className="_feed_inner_comment_box_content_txt" style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <textarea
                  className="form-control _comment_textarea"
                  placeholder="Write a comment"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCommentSubmit(e); } }}
                  disabled={submittingComment}
                  style={{ flex: 1, resize: 'none' }}
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  style={{ marginBottom: '3px', background: '#377DFF', border: 'none', borderRadius: '6px', padding: '7px 16px', fontSize: '13px', color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  {submittingComment ? 'Sending...' : 'Send'}
                </button>
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
      toast.error(getApiError(err, 'Failed to create post.'));
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
      setPosts(prev => {
        if (pageNum === 1) return newPosts;
        const existingIds = new Set(prev.map(p => p.id));
        return [...prev, ...newPosts.filter(p => !existingIds.has(p.id))];
      });
      setHasMore(pageNum < last_page);
    } catch (_) {
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    loadingRef.current = false;
    const run = async () => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      try {
        const res = await getFeed(1);
        if (cancelled) return;
        const { data: newPosts, last_page } = res.data.data;
        setPosts(newPosts);
        setHasMore(1 < last_page);
      } catch (_) {
      } finally {
        if (!cancelled) {
          loadingRef.current = false;
          setLoading(false);
        }
      }
    };
    run();
    return () => { cancelled = true; loadingRef.current = false; };
  }, []);

  useEffect(() => {
    if (page === 1) return;
    loadPosts(page);
  }, [page]);

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
              {(() => { const u = JSON.parse(localStorage.getItem('user') || '{}'); return <Avatar firstName={u.first_name || ''} lastName={u.last_name || ''} size={40} className="_txt_img" />; })()}
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
          <div className="_feed_inner_text_area_bottom_mobile">
            <div className="_feed_inner_text_mobile">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="_feed_inner_text_area_bottom_photo _feed_common">
                  <button
                    type="button"
                    className="_feed_inner_text_area_bottom_photo_link"
                    onClick={() => fileInputRef.current?.click()}
                    title="Add Photo"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h1l2-3h10l2 3h1a2 2 0 012 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </button>
                </div>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  style={{ border: '1px solid #e0e0e0', borderRadius: '6px', padding: '2px 4px', fontSize: '11px', color: '#555', cursor: 'pointer', height: '26px', marginLeft: '8px' }}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="_feed_inner_text_area_btn">
                <button type="button" className="_feed_inner_text_area_btn_link" onClick={handlePost} disabled={posting} style={{ width: '72px', height: '32px', fontSize: '12px' }}>
                  <svg className="_mar_img" xmlns="http://www.w3.org/2000/svg" width="11" height="10" fill="none" viewBox="0 0 14 13">
                    <path fill="#fff" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z" clipRule="evenodd" />
                  </svg>
                  <span>{posting ? '...' : 'Post'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed posts */}
        {posts.map((post) => <PostCard key={post.id} post={post} onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))} />)}

        {loading && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        {hasMore && !loading && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <button
              type="button"
              onClick={() => setPage(prev => prev + 1)}
              style={{ background: '#377DFF', border: 'none', borderRadius: '8px', padding: '9px 28px', fontSize: '14px', color: '#fff', cursor: 'pointer' }}
            >
              Load More
            </button>
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
