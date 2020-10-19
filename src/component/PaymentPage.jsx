import React from 'react';
import moment from 'moment';
import {
    Stitch,
    RemoteMongoClient,
    AnonymousCredential
  } from 'mongodb-stitch-browser-sdk';
import { withRouter } from 'react-router-dom';
import Qbutton from './Qbutton';


class PaymentPage extends React.Component {
    constructor(props){
        super(props);
        this.db = {};
        this.bookingSlot = JSON.parse(localStorage.getItem("slot"));
        this.formatedTime='';
        this.state = {
            name: '',
            timeKey: this.bookingSlot.timeKey,
            dateKey: this.bookingSlot.dateKey,
            date: this.bookingSlot.date,
            service: '',
            phone: '',
            sms: false
        }
    }
   async componentDidMount () {
        this.db = await this.getDB();
        this.formatedTime = this.bookingSlot.timeKey.toString().substr(0, 2)+':'+this.bookingSlot.timeKey.toString().substr(2, 3);
        this.setState({ date: `${this.bookingSlot.date} ${this.formatedTime}` });

        }
    handleSubmit = async (e) => {
        e.preventDefault();
        let parentKey = this.state.dateKey;
        let subParentKey = this.state.timeKey
        let appointobj =   { [parentKey]: { [subParentKey] : this.state } }
        console.log(appointobj);
       this.db = await this.getDB();
       this.saveSlotToDB(this.db,appointobj);
    }
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
        console.log(this.state);
}

    getDB = async () => {
        let stitchAppClient = {};
        if (!Stitch.hasAppClient("demoreactapp-1-limkl")) {
            stitchAppClient = Stitch.initializeDefaultAppClient("demoreactapp-1-limkl");
        } else {
            stitchAppClient = Stitch.defaultAppClient;
        }
        // Log in with anonymous credential
        stitchAppClient.auth
        .loginWithCredential(new AnonymousCredential())
        .then((user) => {
          console.log(`Logged in as anonymous user with id: ${user.id}`)
        })
        .catch(console.error)
        this.db = stitchAppClient
        .getServiceClient(RemoteMongoClient.factory, "mongodb-atlas")
        .db("demoReactApp1");
        return this.db;
        
    }
    saveSlotToDB = async (db,appointobj) => {
        let result = await db.collection('users').find( { appointments :  { $exists: true } } ).toArray();
        console.log('result',result[0].username);
        let allDates = Object.keys(result[0].appointments);
        if(allDates.includes(this.state.dateKey)) {
            Object.assign(result[0].appointments[this.state.dateKey],{ [this.state.timeKey] : this.state });
           let newAppointments = result[0].appointments;
           try {
           let res = await db.collection('users').updateOne({ 'username': result[0].username },
            {
                $set: {
                    appointments: newAppointments,
              }
            },{ upsert: true });

            if(res) {
                this.setState({ sms: true });
            }
           }
           catch(e) {
               console.log(e);
           }
        
        } else {
            Object.assign(result[0].appointments,appointobj);
            let newAppointments = result[0].appointments;
            try {
               let res = await db.collection('users').updateOne({ 'username': result[0].username },
            {
                $set: {
                    appointments: newAppointments,
              }
            },{ upsert: true });
            console.log('result',res);
            
            if(res) {
                this.setState({ sms: true });
                }
            }
            catch(e) {
                console.log(e);
            }
            
        }
        console.log(result,'date',allDates,this.state.dateKey);
        console.log('else case',result[0].appointments);
        return;
    }
    
    render() {
        const text = 'Confirm payment'; 
        return(
            <div className="main-container">
                <div className="bk-inner-container">
                    
                    {this.state.sms ? 
                    <h2>We Send you Text Message Please Check</h2> :
                    <div>
                    <div className="bk-name">Paid</div>
                    <form id="paymentInfo" onChange={(e) => this.handleChange(e)}>
                    <div className="form-container">
                        <div className="field-hf">
                        <div className="form-label">
                            Date
                        </div>
                            <input 
                                type="text"
                                name="dateKey"
                                className="date-time"
                                value={moment(this.bookingSlot.date).format('LL')}
                                disabled
                                />
                        </div>
                        <div className="field-hf">
                        <div className="form-label">
                            Time
                        </div>
                            <input 
                                type="text"
                                name="timeKey"
                                className="date-time"
                                value={this.formatedTime}
                                disabled />
                        </div>
                        <div className="field-fl">
                        <div className="form-label">
                            Client Name
                        </div>
                            <input 
                                type="text"
                                name="name"
                                className="full-field"
                                />
                        </div>
                        <div className="field-fl">
                        <div className="form-label">
                            Phone No
                        </div>
                            <input 
                                type="text"
                                name="phone"
                                className="full-field" />
                        </div>
                        <div className="field-fl">
                        <div className="form-label">
                            Service
                        </div>
                            <input 
                                type="text"
                                name="service"
                                className="full-field" />
                        </div>
                        <div className="field-fl">
                        <div className="form-label">
                            Card numbers
                        </div>
                            <input 
                                type="text"
                                name="card number"
                                className="full-field" />
                        </div> 
                        <div className="field-hf">
                        <div className="form-label">
                            Expiry date
                        </div>
                            <input 
                                type="text"
                                name="expiery"
                                className="date-time" />
                        </div>
                        <div className="field-hf">
                        <div className="form-label">
                            CVV 
                        </div>
                            <input 
                                type="password"
                                name="cvv"
                                className="date-time" />
                        </div>      
                    </div>
                    <div className="que-pbtn-container">
                        <button 
                         type="submit"
                         className="que-btn" 
                         onClick={this.handleSubmit} >
                             {text}
                        </button>
                    </div>
                    </form>
                <div className="hr-pline-contain">
                    <div className="hr-line"></div>
                </div>
                </div>}
                </div>
            </div>   
        )
    }
}

export default PaymentPage;