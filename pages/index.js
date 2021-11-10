import Head from 'next/head'
import Header from '../components/header/Header'
import React from 'react';

export default function Home() {
  return (
    <div>
      <Head>
        <title>CC-Games | HOME</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header isLoggedIn={false}></Header>

    </div>
  )
}
