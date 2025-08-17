"use client";

import { useState, useEffect } from 'react';

interface PendingRequestsCountProps {
  mentorUid: string;
}

export default function PendingRequestsCount({ mentorUid }: PendingRequestsCountProps) {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingRequestsCount();
  }, [mentorUid]);

  const fetchPendingRequestsCount = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/mentorship/pending-requests?mentorUid=${mentorUid}`);
      const data = await response.json();
      
      if (data.success) {
        setCount(data.count || 0);
      } else {
        setCount(0);
      }
    } catch (error) {
      console.error('Error fetching pending requests count:', error);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <span>...</span>;
  }

  return <span>{count}</span>;
}
