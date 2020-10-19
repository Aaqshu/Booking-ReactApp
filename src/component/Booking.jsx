import React from 'react';
import moment from 'moment';
import {
    Stitch,
    RemoteMongoClient,
    AnonymousCredential
  } from 'mongodb-stitch-browser-sdk';
import { Link, withRouter,Redirect } from 'react-router-dom';
import logo from '../assets/userLogo_lg.png';
import rtArrow from '../assets/rt_arrow_lg.png';
import ltArrow from '../assets/lt_arrow_lg.png';
import Qbutton from './Qbutton';
import Lottie from 'react-lottie';
import * as animationData from '../assets/waiting.json';


class Booking extends React.Component {
    constructor(props){
        super(props)
        this.bookingPeriod = 10;
        this.db = {};
        this.appoint = {};
        this.state = {
            isStopped: false,
            isPaused: false,
            isInit: false,
            isSlotSelected: false,
            appointmentArr: [{value: '9:00 am',timeKey: '0900' },{ value: '9:30 am', timeKey: '0930' },{ value: '10:00 am', timeKey: '1000' },{ value: '10:30 am', timeKey: '1030' },{ value: '11:00 am', timeKey: '1100' },{ value: '11:30 am', timeKey: '1130' },
            { value: '12:00 pm', timeKey: '1200' },{ value: '12:30 pm', timeKey: '1230' },{ value: '01:00 pm', timeKey: '1300' },{ value: '1:30 pm', timeKey: '1330' },{ value: '2:00 pm', timeKey: '1400' },
            { value: '02:30 pm', timeKey: '1430' },{ value: '03:00 pm', timeKey: '1500' },{ value: '03:30 pm', timeKey: '1530' },
            { value: '04:00 pm', timeKey: '1600' },{ value: '04:30 pm', timeKey: '1630' },{ value: '05:00 pm', timeKey: '1700' },{ value: '05:30 pm', timeKey: '1730' }]
          ,
            id: undefined,
            timeId: undefined,
            caroselItem: [],
            weekItem: ['S','M','T','W','T','F','S'],
            currentCaroselItem: [],
            lowerIndex: 0,
            isLoading: true,
            isFetchingSlots: false,
            timeKey: [],
        }
    }
     componentDidMount = async () => {
        let caroselItem = [];
        for(let i=0;i<this.bookingPeriod;i++) {
            caroselItem.push({
                dateFormat: moment().add(i, 'days').format('YYYY-MM-DD'),
                queryDate: moment().add(i, 'days').format('YYYYMMDD'),
                date: moment().add(i, 'days').date(),
                weekday: this.state.weekItem[moment().add(i, 'days').day()],
            })
        }
        this.setState({ caroselItem: caroselItem });
        let i=0;
        let currArr = [caroselItem[i],caroselItem[i+1],caroselItem[i+2],caroselItem[i+3],caroselItem[i+4]];
        this.setState({ currentCaroselItem: currArr, lowerIndex: i, upperIndex: (i+4) });
        this.db = await this.getDB();
        let username =  await this.getUser(this.db);
        if(!username) {
            // this.props.history.push("/user-not-found");
        }
        this.setState({ isLoading: false });
        this.handleClick(0,this.state.currentCaroselItem[0].queryDate,this.state.currentCaroselItem[0].dateFormat);
       
    }

    initArr = () => {
        this.state.appointmentArr.forEach((val,i) => {
            if(val.disabled) {
                this.state.appointmentArr[i] =  { timeKey: val.timeKey, value: val.value }
            } 
        })
        this.setState({ isInit: true, appointmentArr: this.state.appointmentArr });
        
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
        const db = stitchAppClient
        .getServiceClient(RemoteMongoClient.factory, "mongodb-atlas")
        .db("demoReactApp1");
        return db;
        
    }

    async getUser(db) {
        this.setState({ isLoading: true });
        let path = this.props.history.location.pathname;
        let splitPath = path.split('/');
        let username = splitPath[1];
        console.log(username);
        if (!username) {
           console.log('no account detected');
            return null;
        }
       
       let result = await db.collection('users').find( { username : username } ).toArray();
    // let result = await db.collection('users').find().toArray();
    // find( { appointments : { $exists: true } } )
        if(result.length > 0) {
                    console.log('user is exist');
                    return username;
                } else {
                    console.log('userdoes not exist');
                } 
        return null;
        
     }

     getAppointmentsOndate = async (date) => {
        this.setState({ isFetchingSlots: true });
       let result = await this.db.collection('users').find( { appointments : { $exists: true } } ).toArray()
       let allDates = Object.keys(result[0].appointments);
       console.log(result,'date',date,allDates);
        let bookedSlots = allDates.filter(bkSlots =>  bkSlots === date)
    // let bookedSlots = allDates.filter(bkSlots =>  bkSlots === '20200730');   
    Object.assign(this.appoint, { dateKey: date });
    if(bookedSlots.length > 0 ) {
        // console.log('bookedSl',Object.keys(result[0].appointments[bookedSlots]));
        let timeKey = Object.keys(result[0].appointments[bookedSlots]);
        this.setState({ timeKey: timeKey });
        return timeKey;
        }
         this.setState({ timeKey: [] });
         this.initArr();
    return null;
     }
     
    handleClick = async (id,date,dateFormat) => {
        if( id === this.state.id ) {
            return;
        }
        this.setState({ id: id });
        await this.getAppointmentsOndate(date);
       this.setState({ isFetchingSlots: false, isInit: false,timeId: undefined });
       Object.assign(this.appoint, { date: dateFormat });
     }
    selectTime = (id, timeKey) => {
        console.log('id',id,'state.id',this.state.id);
        if( id === this.state.timeId || this.state.id === undefined) {
            return;
        }
            this.setState({ timeId: id, isSlotSelected: true });
             Object.assign(this.appoint, { timeKey: timeKey });
            localStorage.setItem('slot',JSON.stringify(this.appoint)); 
    }
     
    giveCaroselItem = (i) => {
        if((i < 0) || (i+4 > this.bookingPeriod - 1)) {
            return;
        }
        const { caroselItem } = this.state
        let currArr = [caroselItem[i],caroselItem[i+1],caroselItem[i+2],caroselItem[i+3],caroselItem[i+4]];
        this.setState({ timeId: undefined, currentCaroselItem: currArr, lowerIndex: i, upperIndex: (i+4),id: undefined });
        this.appoint = {};
        this.initArr();
    }
    render() {
        const defaultOptions = {
            loop: true,
            autoplay: true, 
            animationData: animationData.default,
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid slice'
            }
          };
        const customStyle = {
            opacity: '50%'
        };
        console.log('in render',this.appoint)
       const { isSlotSelected, isFetchingSlots,isInit, id, isLoading, lowerIndex, appointmentArr, timeId, currentCaroselItem } = this.state;
        const text = 'Next';
        if(this.state.timeKey.length > 0 && !isInit) {
            for(let j=0; j < this.state.timeKey.length;j++) {
                appointmentArr.map((val,i) => {
                    if(i === (appointmentArr.length)) {
                        return;
                    }
                  
                    if(parseInt(appointmentArr[i].timeKey) < (parseInt(this.state.timeKey[j])) 
                     && parseInt(appointmentArr[i+1].timeKey) > (parseInt(this.state.timeKey[j]))) {
                              appointmentArr[i] = { timeKey: val.timeKey, value: val.value, disabled: true }
                              return;
                    } 
                    if(parseInt(appointmentArr[i].timeKey) === (parseInt(this.state.timeKey[j]))) {
                        appointmentArr[i] = { timeKey: val.timeKey, value: val.value, disabled: true }
                    }
                })
            }
           
        }
  return (
        <div className="main-container">
            <div className="bk-inner-container">
                <div className="booking-header">
                    <div className="bk-title">Book time</div>
                    <div className="bk-name">Aaquib khan</div>
                    <div className="userpic">
                        <img src={logo} className="App-logo" width="60" height="60" alt="logo" />
                    </div>   
                </div>
                <div className="week-container">
                    <div className="bk-arrow-left" onClick={() => this.giveCaroselItem(lowerIndex-1)}>
                        <img src={ltArrow} width="6.49" height="11.48"></img>
                    </div>
                    <div className="bk-date-day-container">
                    {(currentCaroselItem.length > 0) && currentCaroselItem.map((val,i) => {
                    return(
                    <div 
                        className={ (id === i) ? 'bk-date-day-selected' : 'bk-date-day' }
                        onClick={() => this.handleClick(i,val.queryDate,val.dateFormat)}
                        style={((id !== i) && isFetchingSlots) ? customStyle : null }
                        >
                        <div 
                        className={ (id === i) ? 'bk-day-selected' : 'bk-day' }
                        >{val.weekday}</div>
                        <div className={ (id === i) ? 'bk-date-selected' : 'bk-date' }>{val.date}</div>
                    </div>)
                    })}
                    </div>
                    <div className="bk-arrow-right" onClick={() => this.giveCaroselItem(lowerIndex+1)}>
                        <img src={rtArrow} width="6.49" height="11.48"></img>
                    </div>
                </div>
                {isLoading ? <div className="waiting-spinner">
                <Lottie options={defaultOptions}
                    height={200}
                    width={200}
                    isStopped={this.state.isStopped}
                    isPaused={this.state.isPaused}/>
                    </div> :
                <div className="appointment-container">
                    <div className="free-time-label">
                        Free time
                    </div>
                    {appointmentArr.map((val,i) => {
                        return(
                            <button 
                                className={(timeId === i) ? 'time-label selected' : 'time-label' }
                                onClick={() => this.selectTime(i,val.timeKey)}
                                 disabled={ val.disabled }
                                 style={ val.disabled ? customStyle : null }
                             >{val.value}</button>)
                    })}
                </div>}
                <Link to="/payment">
                    <div className="que-btn-container">
                        <Qbutton content={text} isDisabled={!isSlotSelected} />
                    </div>
                </Link>
                <div className="hr-line-contain">
                    <div className="hr-line"></div>
                </div>

                
        </div>
    </div>
  );
    }
    
}

export default withRouter(Booking);
