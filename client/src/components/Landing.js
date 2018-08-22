import React, { Component } from 'react';
import Layout from './layout/Layout';

class Landing extends Component {
    render() {
        return (
            <Layout>
                <div className="landing" style={{backgroundColor: '#ccc'}}>
                    <h1>Content</h1>
                </div>
            </Layout>
        )
    }
}

export default Landing;
