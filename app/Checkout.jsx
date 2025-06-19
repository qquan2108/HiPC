import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const initialAddresses = [
  {
    name: 'Nguyễn Văn A',
    phone: '0123-456-789',
    address: "26 St Paul's Rd, London N1 2LL, UK",
  },
];

const shoppingList = [
  {
    id: 1,
    name: 'PC Gaming Cupid',
    cpu: ['i5 12400F', 'i7 12400F'],
    image: require('../assets/images/pc1.png'),
    rating: 4.8,
    price: 20840000,
    total: 1,
  },
  {
    id: 2,
    name: 'GeForce RTX 4070',
    vram: ['8GB', '16GB'],
    image: require('../assets/images/pc1.png'),
    rating: 4.8,
    price: 19490000,
    total: 1,
  },
  {
    id: 3,
    name: 'Vỏ case HAVN HS 420',
    color: ['Trắng', 'Đen'],
    image: require('../assets/images/pc1.png'),
    rating: 4.8,
    price: 9899000,
    total: 1,
  },
];

function formatCurrency(num) {
  return num.toLocaleString('vi-VN') + 'đ';
}

export default function Checkout() {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('select'); // 'select' | 'edit' | 'add'
  const [editAddress, setEditAddress] = useState(addresses[0]);

  // Mở modal chọn địa chỉ
  const openSelectModal = () => {
    setModalType('select');
    setModalVisible(true);
  };

  // Mở modal thêm địa chỉ
  const openAddModal = () => {
    setEditAddress({ name: '', phone: '', address: '' });
    setModalType('add');
    setModalVisible(true);
  };

  // Mở modal sửa địa chỉ
  const openEditModal = () => {
    setEditAddress(addresses[selectedAddressIdx]);
    setModalType('edit');
    setModalVisible(true);
  };

  // Xóa địa chỉ
  const handleDeleteAddress = idx => {
    if (addresses.length === 1) return;
    const newAddresses = addresses.filter((_, i) => i !== idx);
    if (selectedAddressIdx === idx) {
      setSelectedAddressIdx(0);
    } else if (selectedAddressIdx > idx) {
      setSelectedAddressIdx(selectedAddressIdx - 1);
    }
    setAddresses(newAddresses);
  };

  // Lưu địa chỉ mới (KHÔNG đổi selectedAddressIdx)
  const handleAddAddress = () => {
    if (!editAddress.name || !editAddress.phone || !editAddress.address) return;
    setAddresses([...addresses, editAddress]);
    setModalVisible(false);
  };

  // Lưu chỉnh sửa địa chỉ
  const handleSaveAddress = () => {
    if (!editAddress.name || !editAddress.phone || !editAddress.address) return;
    const updated = [...addresses];
    updated[selectedAddressIdx] = editAddress;
    setAddresses(updated);
    setModalVisible(false);
  };

  // Chọn địa chỉ
  const handleSelectAddress = idx => {
    setSelectedAddressIdx(idx);
    setModalVisible(false);
  };

  const address = addresses[selectedAddressIdx];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Feather name="arrow-left" size={22} color="#222" />
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Address */}
        <View style={styles.addressRow}>
          <TouchableOpacity style={styles.addressBox} onPress={openSelectModal}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <MaterialIcons name="location-on" size={18} color="#f55858" />
              <Text style={styles.addressTitle}>Delivery Address</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressLabel}>Name: <Text style={styles.addressValue}>{address.name}</Text></Text>
                <Text style={styles.addressLabel}>Phone: <Text style={styles.addressValue}>{address.phone}</Text></Text>
                <Text style={styles.addressLabel}>Address: <Text style={styles.addressValue}>{address.address}</Text></Text>
              </View>
              <TouchableOpacity onPress={openEditModal}>
                <Feather name="edit" size={20} color="#1a73e8" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
            <Feather name="plus-circle" size={26} color="#1a73e8" />
          </TouchableOpacity>
        </View>

        {/* Danh sách địa chỉ đã lưu (ngoại trừ địa chỉ đang chọn) */}
        {addresses.length > 1 && (
          <View style={{ marginHorizontal: 14, marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold', color: '#222', marginBottom: 6 }}>Địa chỉ khác:</Text>
            {addresses.map((addr, idx) => {
              if (idx === selectedAddressIdx) return null;
              return (
                <View
                  key={idx}
                  style={[styles.addressOption, { flexDirection: 'row', alignItems: 'center' }]}
                >
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => setSelectedAddressIdx(idx)}
                  >
                    <Text style={{ fontWeight: 'bold' }}>{addr.name}</Text>
                    <Text>{addr.phone}</Text>
                    <Text>{addr.address}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setEditAddress(addr);
                      setSelectedAddressIdx(idx);
                      setModalType('edit');
                      setModalVisible(true);
                    }}
                    style={{ marginRight: 8 }}
                  >
                    <Feather name="edit" size={18} color="#1a73e8" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteAddress(idx)}
                  >
                    <Feather name="trash-2" size={18} color="#f55858" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Shopping List */}
        <Text style={styles.shoppingTitle}>Shopping List</Text>
        {shoppingList.map(item => (
          <View key={item.id} style={styles.productBox}>
            <View style={{ flexDirection: 'row' }}>
              <Image source={item.image} style={styles.productImage} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.productName}>{item.name}</Text>
                {item.cpu && (
                  <View style={styles.chipRow}>
                    {item.cpu.map((cpu, idx) => (
                      <View key={idx} style={styles.chip}>
                        <Text style={styles.chipText}>{cpu}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {item.vram && (
                  <View style={styles.chipRow}>
                    {item.vram.map((v, idx) => (
                      <View key={idx} style={styles.chip}>
                        <Text style={styles.chipText}>{v}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {item.color && (
                  <View style={styles.chipRow}>
                    {item.color.map((c, idx) => (
                      <View key={idx} style={styles.chip}>
                        <Text style={styles.chipText}>{c}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Text style={styles.rating}>{item.rating} </Text>
                  <Text style={styles.stars}>★★★★★</Text>
                </View>
              </View>
            </View>
            <View style={styles.productFooter}>
              <Text style={styles.totalOrder}>Total Order ({item.total}) :</Text>
              <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {modalType === 'select' && (
              <>
                <Text style={styles.modalTitle}>Chọn địa chỉ giao hàng</Text>
                {addresses.map((addr, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.addressOption,
                      idx === selectedAddressIdx && { borderColor: '#1a73e8', backgroundColor: '#e3f0ff' },
                    ]}
                    onPress={() => handleSelectAddress(idx)}
                  >
                    <Text style={{ fontWeight: 'bold' }}>{addr.name}</Text>
                    <Text>{addr.phone}</Text>
                    <Text>{addr.address}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: '#888', fontWeight: 'bold' }}>Đóng</Text>
                </TouchableOpacity>
              </>
            )}
            {(modalType === 'edit' || modalType === 'add') && (
              <>
                <Text style={styles.modalTitle}>{modalType === 'add' ? 'Thêm địa chỉ mới' : 'Chỉnh sửa địa chỉ'}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Họ tên"
                  value={editAddress.name}
                  onChangeText={text => setEditAddress({ ...editAddress, name: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Số điện thoại"
                  value={editAddress.phone}
                  onChangeText={text => setEditAddress({ ...editAddress, phone: text })}
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Địa chỉ"
                  value={editAddress.address}
                  onChangeText={text => setEditAddress({ ...editAddress, address: text })}
                  multiline
                />
                <View style={styles.modalBtnRow}>
                  <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setModalVisible(false)}>
                    <Text style={{ color: '#888', fontWeight: 'bold' }}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalBtnSave}
                    onPress={modalType === 'add' ? handleAddAddress : handleSaveAddress}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Lưu</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
    letterSpacing: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 14,
  },
  addBtn: {
    marginLeft: 8,
    marginTop: 10,
  },
  addressBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flex: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  addressTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    marginLeft: 6,
  },
  addressLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  addressValue: {
    color: '#222',
    fontWeight: 'bold',
  },
  shoppingTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    marginLeft: 18,
    marginBottom: 8,
  },
  productBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 14,
    marginBottom: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#f3f3f3',
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
  },
  chipRow: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  chip: {
    backgroundColor: '#f3f3f3',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 2,
  },
  chipText: {
    fontSize: 12,
    color: '#222',
    fontWeight: 'bold',
  },
  rating: {
    color: '#fbc02d',
    fontWeight: 'bold',
    fontSize: 13,
    marginRight: 2,
  },
  stars: {
    color: '#fbc02d',
    fontSize: 13,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  totalOrder: {
    fontSize: 13,
    color: '#888',
    fontWeight: 'bold',
  },
  productPrice: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    elevation: 5,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
    color: '#222',
    backgroundColor: '#fafafa',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalBtnCancel: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#f3f3f3',
    marginRight: 8,
  },
  modalBtnSave: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#f55858',
  },
  addressOption: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
});