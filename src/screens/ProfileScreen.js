import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  Animated,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import * as ImagePicker from 'react-native-image-picker';  // expo: `expo install react-native-image-picker`

/* -------------------------------------------------------------------------- */
/*  Endpoints                                                                 */
/* -------------------------------------------------------------------------- */
const TRIAGE_URL  = 'https://binkhoale1812-triage-llm.hf.space';       // /summarize lives here
const PROFILE_URL = 'https://binkhoale1812-medical-profile.hf.space';  // /get_profile , /predict

/* -------------------------------------------------------------------------- */
/*  Auth – replace with context / secure store                                */
/* -------------------------------------------------------------------------- */
const auth = {username: 'Khoa', password: '122003', user_id: 'abc123'};

/* -------------------------------------------------------------------------- */
const FIELD_ORDER = [
  'fullName',
  'dateOfBirth',
  'gender',
  'bloodType',
  'allergies',
  'pastMedicalHistory',
  'currentMedication',
  'disability',
  'insuranceCard',
  'address',
  'emergencyContact',
  'medicalDocuments'
];

const ICONS = {
  fullName: 'user',
  dateOfBirth: 'birthday-cake',
  gender: 'venus-mars',
  bloodType: 'tint',
  allergies: 'exclamation-circle',
  pastMedicalHistory: 'file-medical',
  currentMedication: 'capsules',
  disability: 'wheelchair',
  insuranceCard: 'id-card',
  address: 'map-marker-alt',
  emergencyContact: 'phone-alt',
  medicalDocuments: 'file-upload',
};

const ProfileScreen = () => {
  /* ---------------------------- state ------------------------------------ */
  const [profile, setProfile]   = useState(null);
  const [editing, setEditing]   = useState(false);
  const [buttonScale]           = useState(new Animated.Value(1));

  /* ------------------------ load on mount -------------------------------- */
  useEffect(() => { loadUserProfile(); }, []);

  const loadUserProfile = async () => {
    try {
      const res  = await fetch(`${PROFILE_URL}/get_profile`, {
        method : 'POST',
        headers: {'Content-Type':'application/json'},
        body   : JSON.stringify({username: auth.username, password: auth.password})
      });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        const p = json.profile;
        setProfile({
          fullName:            p.name                     || '',
          dateOfBirth:         p.dob                      || '',
          gender:              p.sex                      || '',
          bloodType:           p.blood_type               || '',
          allergies:           (p.allergies||[]).join(', '),
          pastMedicalHistory:  (p.medical_history||[]).join(', '),
          currentMedication:   (p.active_medications||[]).join(', '),
          disability:          p.disability               || '',
          insuranceCard:       p.insurance_card           || '',
          address:             p.home_address             || '',
          emergencyContact:    `${p.emergency_contact?.name||''} - ${p.emergency_contact?.phone||''}`,
          medicalDocuments: []
        });
      } else {
        Alert.alert('Load failed', json.message || 'Unknown error');
      }
    } catch (e) { console.warn('Profile load error', e); }
  };

  /* --------------------- save back to backend ---------------------------- */
  const handleSave = async () => {
    const payload = {
      username:           auth.username,
      password:           auth.password,
      user_id:            auth.user_id,
      name:               profile.fullName,
      dob:                profile.dateOfBirth,
      sex:                profile.gender,
      phone_number:       '',
      email_address:      auth.username,
      blood_type:         profile.bloodType,
      allergies:          profile.allergies.split(',').map(s=>s.trim()),
      medical_history:    profile.pastMedicalHistory.split(',').map(s=>s.trim()),
      active_medications: profile.currentMedication.split(',').map(s=>s.trim()),
      disability:         profile.disability,
      insurance_card:     profile.insuranceCard,
      home_address:       profile.address,
      emergency_contact: {
        name : profile.emergencyContact.split(' - ')[0] || 'N/A',
        phone: profile.emergencyContact.split(' - ')[1] || 'N/A'
      },
      last_updated: new Date().toISOString()
    };

    try {
      const r = await fetch(`${PROFILE_URL}/predict`, {
        method : 'POST',
        headers: {'Content-Type':'application/json'},
        body   : JSON.stringify(payload)
      });
      const j = await r.json();
      if (j.status === 'success') {
        Alert.alert('Profile updated');
        setEditing(false);
      } else { throw new Error(j.message); }
    } catch (e) {
      Alert.alert('Save failed', e.message || 'Network error');
    }
  };

  /* ----------------------------- upload + summarise ---------------------- */
  const pickAndSummarise = () => {
    ImagePicker.launchDocument({selectionLimit: 1}, async (resp) => {
      if (resp.didCancel || resp.errorCode) return;
      const f = resp.assets[0];
      const form = new FormData();
      form.append('file', {
        uri : f.uri,
        type: f.type || 'application/pdf',
        name: f.fileName || 'upload'
      });
      try {
        const r = await fetch(`${TRIAGE_URL}/summarize`, {
          method : 'POST',
          headers: {'Content-Type': 'multipart/form-data'},
          body   : form
        });
        const j = await r.json();
        if (j.status === 'success') {
          setProfile(p => ({
            ...p,
            pastMedicalHistory : j.summary,
            currentMedication  : j.summary
          }));
        } else throw new Error(j.message);
      } catch (e) { Alert.alert('Summarise error', e.message); }
    });
  };

  /* ---------------------------- UI helpers ------------------------------- */
  const fmt = (k) => k.replace(/([A-Z])/g, ' $1').replace(/^./, s=>s.toUpperCase());

  const pressIn  = () => Animated.spring(buttonScale,{toValue:0.95,useNativeDriver:true}).start();
  const pressOut = () => Animated.spring(buttonScale,{toValue:1,useNativeDriver:true}).start();

  if (!profile) return <SafeAreaView style={styles.container}><Text style={{textAlign:'center',marginTop:40}}>Loading…</Text></SafeAreaView>;

  /* ------------------------------ render --------------------------------- */
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.avatar}><FontAwesome5 name="user-circle" size={48} color="#fff" /></View>
        <Text style={styles.header}>My Medical Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {FIELD_ORDER.map(key => (
          (key==='medicalDocuments' && !editing) ? null : (     /* hide upload row in view-mode */
          <View key={key} style={styles.fieldContainer}>
            <View style={styles.labelContainer}>
              <FontAwesome5 name={ICONS[key]} size={18} color="#007BFF" style={styles.fieldIcon}/>
              <Text style={styles.label}>{fmt(key)}</Text>
            </View>

            {key === 'medicalDocuments' ? (
              <TouchableOpacity style={styles.uploadBtn} onPress={pickAndSummarise}>
                <Text style={{color:'#007BFF'}}>Upload PDF / Image</Text>
              </TouchableOpacity>
            ) : key === 'insuranceCard' ? (
              editing ? (
                <TextInput
                  style={styles.input}
                  value={profile.insuranceCard}
                  placeholder="Enter insurance number"
                  onChangeText={v=>setProfile({...profile,insuranceCard:v})}
                />
              ) : (
                <Text style={styles.value}>{profile.insuranceCard||'Not specified'}</Text>
              )
            ) : key === 'pastMedicalHistory' || key === 'currentMedication' ? (
              editing ? (
                <TextInput
                  style={[styles.input,{height:90,textAlignVertical:'top'}]}
                  multiline
                  value={profile[key]}
                  onChangeText={v=>setProfile({...profile,[key]:v})}
                  placeholder={`Enter ${fmt(key)}`}
                />
              ) : (
                <Text style={styles.value}>{profile[key]||'Not specified'}</Text>
              )
            ) : editing ? (
              <TextInput
                style={styles.input}
                value={profile[key]}
                onChangeText={v=>setProfile({...profile,[key]:v})}
                placeholder={`Enter ${fmt(key)}`}
              />
            ) : (
              <Text style={styles.value}>{key==='dateOfBirth' ? new Date(profile[key]).toLocaleDateString() : profile[key] || 'Not specified'}</Text>
            )}
          </View>)
        ))}

        <Animated.View style={[styles.buttonContainer,{transform:[{scale:buttonScale}]}]}>
          <TouchableOpacity
            style={[styles.button, editing?styles.saveButton:styles.editButton]}
            onPressIn={pressIn} onPressOut={pressOut}
            onPress={editing?handleSave:()=>setEditing(true)}
          >
            <FontAwesome5 name={editing?'save':'edit'} size={18} color="#fff" style={styles.buttonIcon}/>
            <Text style={styles.buttonText}>{editing?'Save Changes':'Edit Profile'}</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{height:100}}/>
      </ScrollView>
    </SafeAreaView>
  );
};

/* -------------------------------------------------------------------------- */
/*  Styles                                                                    */
/* -------------------------------------------------------------------------- */
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#F8FAFC'},
  headerContainer:{alignItems:'center',padding:20,backgroundColor:'#fff',borderBottomWidth:1,borderBottomColor:'#E5E7EB'},
  avatar:{width:80,height:80,borderRadius:40,backgroundColor:'#007BFF',alignItems:'center',justifyContent:'center',marginBottom:12},
  header:{fontFamily:'Inter-SemiBold',fontSize:24,color:'#1F2937',fontWeight:'600'},
  scrollContent:{padding:20},
  fieldContainer:{marginBottom:12,backgroundColor:'#fff',padding:16,borderRadius:16,elevation:1},
  labelContainer:{flexDirection:'row',alignItems:'center',marginBottom:8},
  fieldIcon:{marginRight:8},
  label:{fontSize:14,fontWeight:'600',color:'#1F2937'},
  value:{fontSize:16,color:'#1F2937',lineHeight:24},
  input:{borderWidth:1,borderColor:'#D1D5DB',padding:12,borderRadius:12,fontSize:16,backgroundColor:'#F9FAFB',color:'#1F2937'},
  uploadBtn:{borderWidth:1,borderColor:'#007BFF',padding:12,borderRadius:10,alignItems:'center'},
  buttonContainer:{marginTop:20},
  button:{flexDirection:'row',padding:16,borderRadius:24,alignItems:'center',justifyContent:'center',elevation:3},
  editButton:{backgroundColor:'#007BFF'},
  saveButton:{backgroundColor:'#34D399'},
  buttonIcon:{marginRight:8},
  buttonText:{color:'#fff',fontSize:16,fontWeight:'600'}
});

export default ProfileScreen;
