import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { addReview } from '../actions';

const AddReview = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [review, setReview] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addReview(id, review));
    setReview('');
    navigate(`/spot/${id}`);
  };

  return (
    <div>
      <h1>הוסף ביקורת</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          required
          placeholder="כתוב את הביקורת שלך כאן..."
        ></textarea>
        <button type="submit">שלח</button>
      </form>
    </div>
  );
};

export default AddReview;
