import { useAuth } from '../auth/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';

function MandatoryPasswordChange() {
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    const debeCambiar = user.cambio_contra !== true;

    if (!debeCambiar) {
        return null;
    }

    return <ChangePasswordModal open blocking />;
}

export default MandatoryPasswordChange;