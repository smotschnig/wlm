import React, { Component } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

class Layout extends Component {
    render() {
        return (
            <div className="layout">
                <Header />
                <Sidebar />
                {this.props.children}
                <Footer />
            </div>
        );
    }
}

export default Layout;